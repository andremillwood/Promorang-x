import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import colors from '@/constants/colors';

interface LineChartProps {
  data: { date: string; price: number }[];
  width?: number;
  height?: number;
  style?: any;
}

// This is a simplified mock LineChart component since we can't use actual chart libraries
// In a real app, you would use a library like react-native-chart-kit
export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  width = Dimensions.get('window').width - 64, 
  height = 220,
  style = {}
}) => {
  const maxPrice = Math.max(...data.map(d => d.price));
  const minPrice = Math.min(...data.map(d => d.price));
  const priceRange = maxPrice - minPrice;
  
  return (
    <View style={[styles.container, { width, height }, style]}>
      <Text style={styles.mockText}>Price History Chart</Text>
      <View style={styles.mockChart}>
        {data.map((item, index) => {
          const normalizedHeight = priceRange > 0 ? ((item.price - minPrice) / priceRange) * 100 : 50;
          return (
            <View key={index} style={styles.dataPoint}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: Math.max(normalizedHeight, 10),
                    backgroundColor: colors.primary
                  }
                ]} 
              />
              <Text style={styles.label}>{item.date}</Text>
              <Text style={styles.priceLabel}>${item.price.toFixed(2)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  mockText: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: 8,
  },
  mockChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: 120,
  },
  dataPoint: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: colors.darkGray,
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '500',
  },
});