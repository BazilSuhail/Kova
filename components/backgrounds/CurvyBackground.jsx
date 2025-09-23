import { Dimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function CurvyBackground({ theme = 'light' }) {
  // Background and curve colors based on theme
  const bgColor = theme === 'dark' ? '#030712' : '#D1FAE5'; // dark gray / light emerald
  const lineColor = theme === 'dark' ? '#10B981' : '#059669'; // light emerald for dark, darker emerald for light
  const secondaryLineColor = theme === 'dark' ? '#047857' : '#34D399'; // for layered effect

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, width, height, backgroundColor: bgColor }}>
      <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Top curve line */}
        <Path
          d={`
            M0,50
            Q${width / 2},100 ${width},50
          `}
          stroke={lineColor}
          strokeWidth={2}
          fill="none"
        />

        {/* Middle curve line */}
        <Path
          d={`
            M0,200
            C${width / 4},250 ${3 * width / 4},150 ${width},200
          `}
          stroke={secondaryLineColor}
          strokeWidth={2}
          fill="none"
        />

        {/* Bottom curve line */}
        <Path
          d={`
            M0,350
            Q${width / 2},300 ${width},350
          `}
          stroke={lineColor}
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    </View>
  );
}
