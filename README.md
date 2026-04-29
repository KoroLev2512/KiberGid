# KiberGid Admin

Мобильное админ-приложение для платформы **KiberGid** — создание интерактивных
аудиоэкскурсий. Написано на React Native + Expo + TypeScript.

## Что умеет MVP

- Список туров с фильтром по статусу (черновик / готов / опубликован).
- Редактор тура со всеми обязательными полями:
  - базовая идентификация (название),
  - вводные тексты — «Введение» и «Заключение»,
  - атрибуты: язык/локаль, страна + город, категории/темы,
  - правила «откуда/куда»: стартовая и конечная точки (с опцией «заканчивается там же»),
  - скелет маршрута (шаги-остановки, перетасовка, удаление),
  - режим продаж (есть билет / нет билета + цена/валюта),
  - статус готовности (черновик → готов → опубликован).
- Экран шага маршрута (название, описание, гео-точка, аудио/изображение).
- Пикеры: язык, страна+город, категории, гео-точка.
- Предпросмотр тура — как он будет выглядеть для пользователя.
- Валидация готовности: публикация блокируется, пока не заполнены все обязательные поля.
- Локальное сохранение в AsyncStorage (Zustand + persist).

## Стек

- Expo SDK 54, React Native 0.81, React 19
- TypeScript
- React Navigation (native-stack)
- Zustand + AsyncStorage для локального стора
- Дизайн-токены из `src/theme/tokens.ts` — один в один по CSS-переменным KiberGid

## Структура

```
src/
  components/    // UI-примитивы: Button, Input, Chip, Section, Row, SegmentedControl...
  constants/     // справочники (локали, категории, страны/города)
  navigation/    // RootNavigator, типы роутов
  screens/       // экраны: список, редактор тура, шаг, предпросмотр
  screens/pickers/ // модальные пикеры
  store/         // zustand-стор туров
  theme/         // design tokens + готовые текстовые стили
  types/         // доменная модель (Tour, TourStep, TourStatus)
  utils/         // валидация, генерация id
App.tsx          // корень с SafeAreaProvider и навигатором
```

## Запуск

```bash
npm install
npm start       # Metro bundler (Expo)
npm run ios     # iOS-симулятор
npm run android # Android-эмулятор
npm run web     # веб-режим Expo
```

## Android APK / AAB (EAS)

В проект добавлен `eas.json` с профилями:

- `preview` → APK (внутреннее тестирование)
- `production` → AAB (Google Play)

Совет по уменьшению веса:
- для релиза лучше собирать **AAB** (Play Market сам режет по ABI и плотностям);
- для APK включены **ABI splits** (`armeabi-v7a`, `arm64-v8a`), поэтому APK обычно меньше.

Команды:

```bash
npx eas-cli login
npx eas-cli build -p android --profile preview     # APK
npx eas-cli build -p android --profile production  # AAB
```

Перед cloud-сборкой добавь env в EAS (один раз):

```bash
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co" --environment production
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_KEY --value "YOUR_PUBLISHABLE_KEY" --environment production
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_TOURS_TABLE --value "routes" --environment production
```

## Авторизация через Supabase

Для входа/регистрации нужны публичные ключи проекта Supabase. Создайте `.env` в корне:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EXPO_PUBLIC_SUPABASE_REDIRECT_URL=https://admin.your-domain.com/
EXPO_PUBLIC_SUPABASE_TOURS_TABLE=tours
EXPO_PUBLIC_SUPABASE_IMAGES_BUCKET=images
EXPO_PUBLIC_SUPABASE_AUDIO_BUCKET=audio
EXPO_PUBLIC_SUPABASE_VIDEO_BUCKET=videos
```

Дополнительно поддерживается старое имя ключа: `EXPO_PUBLIC_SUPABASE_KEY`.
Для ссылок восстановления пароля/подтверждения email в проде укажи
`EXPO_PUBLIC_SUPABASE_REDIRECT_URL` (иначе на web в dev будет использоваться localhost).
Если у тебя в проекте таблица называется иначе (например `routes`), укажи это
в `EXPO_PUBLIC_SUPABASE_TOURS_TABLE`.

Для загрузки медиа из шага маршрута нужны Storage buckets:
- `images` (или имя из `EXPO_PUBLIC_SUPABASE_IMAGES_BUCKET`)
- `audio` (или имя из `EXPO_PUBLIC_SUPABASE_AUDIO_BUCKET`)
- `videos` (или имя из `EXPO_PUBLIC_SUPABASE_VIDEO_BUCKET`)

После этого перезапустите Expo с очисткой кэша:

```bash
npm run web -- --clear
```

В приложении появится экран авторизации (регистрация + вход по email/password).
Там же доступны:

- восстановление пароля по email (`Forgot password`);
- повторная отправка письма подтверждения после регистрации.

## Таблицы и RLS (Supabase)

Добавлена миграция с таблицей туров и политиками доступа только к своим данным:

- `supabase/migrations/20260429003000_create_tours_table_with_rls.sql`
- `supabase/migrations/20260429013000_admin_roles_profiles_and_policies.sql`
- `supabase/migrations/20260429030000_routes_table_compat.sql` (если используешь таблицу `routes`)

Что делает миграция:

- создает `public.tours`;
- включает RLS;
- добавляет `SELECT/INSERT/UPDATE/DELETE` policy через `auth.uid() = owner_id`;
- обновляет `updated_at` триггером.

После входа приложение загружает туры текущего пользователя из Supabase и синхронизирует
изменения `create/update/delete` обратно в таблицу `tours`.
Для защиты от конфликтов записи используется проверка `updated_at`: если в Supabase уже есть
более свежая версия тура, локальная запись не перезаписывает серверную, а подтягивает актуальные данные.

Для пользователей с ролью `admin` (в `auth.users.raw_app_meta_data.role`):

- доступен экран `Админка`;
- видны все экскурсии;
- можно одобрять публикацию (перевод `ready` → `published`);
- доступен список пользователей из `public.profiles`.

Если в проекте уже есть таблица `routes`, оставь `EXPO_PUBLIC_SUPABASE_TOURS_TABLE=routes`
и примени `20260429030000_routes_table_compat.sql`, чтобы добавить недостающие поля и RLS-политики.

Для iOS нужен Xcode, для Android — Android Studio с эмулятором. Для быстрого
теста на реальном устройстве запустите `npm start` и откройте QR-код в Expo Go.

## Что дальше (идеи для расширения)

- Карта в PointPicker (react-native-maps / yandex-maps).
- Загрузка аудио и изображений из галереи (expo-image-picker, expo-av).
- Синхронизация с бекендом KiberGid (авторизация, публикация туров).
- Модерация / ревью до публикации.
- Многоязычные варианты одного тура.
