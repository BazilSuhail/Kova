import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const TaskProgressChart = ({ tasks = [], title = "Task Completion Trend", isDark = false }) => {
  const screenWidth = Dimensions.get('window').width;

  // Process tasks data to create chart data
  const { chartData, stats } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        chartData: [{ value: 0, label: 'No Data', labelTextStyle: { color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 } }],
        stats: { totalTasks: 0, completedTasks: 0, completionRate: 0, activeDays: 0 }
      };
    }

    // Group tasks by date and calculate completion rate
    const tasksByDate = tasks.reduce((acc, task) => {
      const dateStr = task.createdAt ? 
        new Date(task.createdAt).toISOString().split('T')[0] : 
        task.dueDate || new Date().toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = { total: 0, completed: 0 };
      }
      
      acc[dateStr].total += 1;
      if (task.isCompleted) {
        acc[dateStr].completed += 1;
      }
      
      return acc;
    }, {});

    // Sort dates and get last 7 days of data
    const sortedDates = Object.keys(tasksByDate).sort().slice(-7);
    
    if (sortedDates.length === 0) {
      return {
        chartData: [{ value: 0, label: 'Today', labelTextStyle: { color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 } }],
        stats: { totalTasks: tasks.length, completedTasks: 0, completionRate: 0, activeDays: 0 }
      };
    }

    const completionData = sortedDates.map((date, index) => {
      const dayData = tasksByDate[date];
      const completionRate = dayData.total > 0 ? (dayData.completed / dayData.total) * 100 : 0;
      const dateObj = new Date(date);
      const label = dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });

      return {
        value: completionRate,
        label: label,
        labelTextStyle: { 
          color: isDark ? '#9ca3af' : '#6b7280', 
          fontSize: 10 
        },
        dataPointText: `${Math.round(completionRate)}%`,
        textShiftY: -10,
        textShiftX: 0,
        textColor: isDark ? '#10b981' : '#059669',
        textFontSize: 10
      };
    });

    // Ensure we have at least 2 data points
    if (completionData.length === 1) {
      completionData.unshift({
        value: 0,
        label: 'Prev',
        labelTextStyle: { color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 },
        hideDataPoint: true
      });
    }

    // Calculate overall stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const activeDays = sortedDates.length;

    return {
      chartData: completionData,
      stats: { totalTasks, completedTasks, completionRate, activeDays }
    };
  }, [tasks, isDark]);

  // Get trend direction
  const getTrend = () => {
    if (chartData.length < 2) return 'stable';
    
    const visibleData = chartData.filter(item => !item.hideDataPoint);
    if (visibleData.length < 2) return 'stable';
    
    const lastValue = visibleData[visibleData.length - 1].value;
    const previousValue = visibleData[visibleData.length - 2].value;
    
    if (lastValue > previousValue) return 'up';
    if (lastValue < previousValue) return 'down';
    return 'stable';
  };

  const trend = getTrend();
  const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove';
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280';

  return (
    <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 mb-6 border mx-3 border-gray-100 dark:border-gray-700">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name={trendIcon} size={16} color={trendColor} />
            <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'} trend
            </Text>
          </View>
        </View>
        
        <View className="items-end">
          <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.completionRate}%
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Overall
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View className="mb-4">
        {chartData[0].label === 'No Data' ? (
          <View className="h-48 items-center justify-center">
            <Ionicons name="analytics-outline" size={48} color={isDark ? '#4b5563' : '#d1d5db'} />
            <Text className="text-gray-400 dark:text-gray-500 mt-2">
              No task data available
            </Text>
          </View>
        ) : (
          <LineChart
            data={chartData}
            width={250}
            height={150}
            // Emerald color scheme
            color="#10b981"
            color1="#10b981"
            color2="#059669"
            dataPointsColor="#10b981"
            dataPointsRadius={6}
            dataPointsWidth={2}
            dataPointsColor1="#ffffff"
            textColor1={isDark ? '#9ca3af' : '#6b7280'}
            // Styling
            thickness={3}
            curved
            isAnimated
            animationDuration={1200}
            // Grid and axes
            showVerticalLines={false}
            showHorizontalLines={true}
            horizontalLinesColor={isDark ? '#374151' : '#f3f4f6'}
            yAxisColor={isDark ? '#4b5563' : '#d1d5db'}
            xAxisColor={isDark ? '#4b5563' : '#d1d5db'}
            yAxisTextStyle={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }}
            xAxisLabelTextStyle={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}
            // Area under curve
            areaChart
            startFillColor="#10b981"
            endFillColor="#10b981"
            startOpacity={0.2}
            endOpacity={0.05}
            // Data points
            hideDataPoints={false}
            showDataPointOnPress
            stripHeight={200}
            stripColor={isDark ? '#374151' : '#f9fafb'}
            stripOpacity={0.5}
            // Y-axis range
            yAxisOffset={0}
            maxValue={100}
            noOfSections={4}
            // Styling
            backgroundColor="transparent"
            initialSpacing={20}
            endSpacing={20}
            spacing={Math.max(40, (screenWidth - 120) / Math.max(1, chartData.length - 1))}
            // Labels
            showXAxisIndices={false}
            showYAxisIndices={false}
            hideYAxisText={false}
            yAxisSide="left"
            rotateLabel={false}
            hideOrigin={false}
          />
        )}
      </View>
 
    </View>
  );
};

export default TaskProgressChart;