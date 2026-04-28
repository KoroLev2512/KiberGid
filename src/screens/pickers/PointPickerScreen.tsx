import React, { useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  LayoutChangeEvent,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Section } from '../../components/Section';
import { ScreenProps } from '../../navigation/types';
import { useTour, useToursStore } from '../../store/toursStore';
import { colors, spacing } from '../../theme';
import { GeoPoint } from '../../types/tour';

/**
 * MVP-пикер точки. Вместо полноценной карты позволяет задать
 * человекочитаемый адрес и опционально координаты (широта/долгота).
 * Полный пикер с картой можно подключить на следующем шаге
 * (react-native-maps / yandex-maps / mapbox).
 */
export const PointPickerScreen: React.FC<ScreenProps<'PointPicker'>> = ({
  route,
  navigation,
}) => {
  const { tourId, kind, stepId, title } = route.params;
  const tour = useTour(tourId);
  const updateTour = useToursStore((s) => s.updateTour);
  const updateStep = useToursStore((s) => s.updateStep);

  const currentPoint: GeoPoint | undefined =
    kind === 'start'
      ? tour?.startPoint
      : kind === 'end'
        ? tour?.endPoint
        : tour?.steps.find((s) => s.id === stepId)?.point;

  const [address, setAddress] = useState(currentPoint?.address ?? '');
  const [lat, setLat] = useState(
    currentPoint?.latitude != null ? String(currentPoint.latitude) : ''
  );
  const [lng, setLng] = useState(
    currentPoint?.longitude != null ? String(currentPoint.longitude) : ''
  );
  const [mapSize, setMapSize] = useState({ width: 1, height: 180 });
  const mapBoundsRef = useRef({ pageX: 0, pageY: 0 });
  const [zoom, setZoom] = useState(14);

  const handleSave = () => {
    if (!tour) return;
    const parsedLat = parseFloat(lat.replace(',', '.'));
    const parsedLng = parseFloat(lng.replace(',', '.'));
    const point: GeoPoint = {
      address: address.trim() || undefined,
      latitude: Number.isFinite(parsedLat) ? parsedLat : undefined,
      longitude: Number.isFinite(parsedLng) ? parsedLng : undefined,
    };

    if (kind === 'start') {
      updateTour(tour.id, {
        startPoint: point,
        endPoint: tour.endSameAsStart ? point : tour.endPoint,
      });
    } else if (kind === 'end') {
      updateTour(tour.id, { endPoint: point });
    } else if (kind === 'step' && stepId) {
      updateStep(tour.id, stepId, { point });
    }
    navigation.goBack();
  };

  const parsedLat = parseFloat(lat.replace(',', '.'));
  const parsedLng = parseFloat(lng.replace(',', '.'));
  const hasCoords = Number.isFinite(parsedLat) && Number.isFinite(parsedLng);
  const centerLat = hasCoords ? parsedLat : 59.9386;
  const centerLng = hasCoords ? parsedLng : 30.3141;
  const staticMapUrl =
    `https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll=${centerLng},${centerLat}` +
    `&z=${zoom}&l=map&size=650,320&pt=${centerLng},${centerLat},pm2rdm`;

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const lngToX = (lngValue: number, worldSize: number) =>
    ((lngValue + 180) / 360) * worldSize;
  const latToY = (latValue: number, worldSize: number) => {
    const rad = (latValue * Math.PI) / 180;
    return (
      ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      worldSize
    );
  };
  const xToLng = (x: number, worldSize: number) => (x / worldSize) * 360 - 180;
  const yToLat = (y: number, worldSize: number) => {
    const n = Math.PI - (2 * Math.PI * y) / worldSize;
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  };

  const getPointerCoords = (event: GestureResponderEvent) => {
    const native = event.nativeEvent as GestureResponderEvent['nativeEvent'] & {
      offsetX?: number;
      offsetY?: number;
      pageX?: number;
      pageY?: number;
    };
    const x =
      typeof native.locationX === 'number' ? native.locationX :
      typeof native.offsetX === 'number' ? native.offsetX :
      typeof native.pageX === 'number' ? native.pageX - mapBoundsRef.current.pageX :
      NaN;
    const y =
      typeof native.locationY === 'number' ? native.locationY :
      typeof native.offsetY === 'number' ? native.offsetY :
      typeof native.pageY === 'number' ? native.pageY - mapBoundsRef.current.pageY :
      NaN;
    return { x, y };
  };

  const pickPointOnMap = (event: GestureResponderEvent) => {
    const { x, y } = getPointerCoords(event);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const worldSize = 256 * 2 ** zoom;
    const cx = lngToX(centerLng, worldSize);
    const cy = latToY(centerLat, worldSize);
    const topLeftX = cx - mapSize.width / 2;
    const topLeftY = cy - mapSize.height / 2;
    const mapX = topLeftX + clamp(x, 0, mapSize.width);
    const mapY = topLeftY + clamp(y, 0, mapSize.height);

    const nextLng = xToLng(mapX, worldSize);
    const nextLat = yToLat(mapY, worldSize);
    setLat(nextLat.toFixed(6));
    setLng(nextLng.toFixed(6));
  };

  const onMapLayout = (event: LayoutChangeEvent) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setMapSize({ width: Math.max(1, width), height: Math.max(1, height) });
    mapBoundsRef.current = { pageX: x, pageY: y };
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: pickPointOnMap,
    onPanResponderMove: pickPointOnMap,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Section label="Адрес" title="Что видит пользователь">
          <Input
            variant="white"
            value={address}
            onChangeText={setAddress}
            placeholder="Например: Дворцовая площадь, 1"
          />
        </Section>

        <Section
          label="Координаты"
          title="GPS (необязательно)"
          hint="Точные координаты нужны, чтобы отобразить пин на карте."
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                variant="white"
                label="Широта"
                value={lat}
                keyboardType="numeric"
                onChangeText={setLat}
                placeholder="59.9386"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                variant="white"
                label="Долгота"
                value={lng}
                keyboardType="numeric"
                onChangeText={setLng}
                placeholder="30.3141"
              />
            </View>
          </View>
          <View style={styles.mapWrap}>
            <View style={styles.inlineControls}>
              <Button
                title="-"
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => setZoom((z) => Math.max(3, z - 1))}
              />
              <Text style={styles.zoomText}>Масштаб: {zoom}</Text>
              <Button
                title="+"
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => setZoom((z) => Math.min(19, z + 1))}
              />
            </View>
            <Pressable
              onPress={pickPointOnMap}
              onLayout={onMapLayout}
              style={styles.inlineMapWrap}
              {...panResponder.panHandlers}
            >
              <Image source={{ uri: staticMapUrl }} style={styles.mapImage} />
              <View pointerEvents="none" style={styles.crosshairWrap}>
                <View style={styles.crosshairV} />
                <View style={styles.crosshairH} />
              </View>
            </Pressable>
            <Text style={styles.mapHint}>
              Перемещайте карту пальцем/мышью: центр карты станет выбранной точкой.
            </Text>
          </View>
        </Section>

        <Button title="Сохранить" variant="black" onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPage },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mapWrap: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  inlineControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineMapWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.bgSurface,
  },
  mapImage: {
    width: '100%',
    height: 320,
    backgroundColor: colors.bgSurface,
  },
  mapHint: {
    color: colors.textSecondary,
  },
  zoomText: {
    color: colors.textPrimary,
  },
  crosshairWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairV: {
    position: 'absolute',
    width: 2,
    height: 30,
    backgroundColor: colors.danger,
  },
  crosshairH: {
    position: 'absolute',
    height: 2,
    width: 30,
    backgroundColor: colors.danger,
  },
});
