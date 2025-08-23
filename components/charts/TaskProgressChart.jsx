import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

const TaskProgressChart = ({
  tasks = [],
  title = "Task Progress",
  isDark
}) => {
  const [chartWidth, setChartWidth] = useState(screenWidth);

  // Process tasks data for line chart
  const processTasksData = () => {
    if (!tasks || tasks.length === 0) return null;

    // Group tasks by date for line chart
    const tasksByDate = tasks.reduce((acc, task) => {
      const date = new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      if (!acc[date]) {
        acc[date] = { completed: 0, total: 0 };
      }

      acc[date].total += 1;
      if (task.isCompleted) {
        acc[date].completed += 1;
      }

      return acc;
    }, {});

    const dates = Object.keys(tasksByDate).sort();
    const completedData = dates.map(date => tasksByDate[date].completed);
    const totalData = dates.map(date => tasksByDate[date].total);

    return {
      dates,
      completedData,
      totalData,
      tasksByDate
    };
  };

  // Calculate overall stats
  const getStats = () => {
    const completed = tasks.filter(task => task.isCompleted).length;
    const total = tasks.length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, pending, completionRate };
  };

  const stats = getStats();
  const chartData = processTasksData();

  // Color scheme based on dark mode
  const colors = {
    primary: isDark === 'dark' ? '#10b981' : '#059669',
    secondary: isDark === 'dark' ? '#6b7280' : '#9ca3af',
    background: isDark === 'dark' ? '#1f2937' : '#ffffff',
    text: isDark === 'dark' ? '#f9fafb' : '#111827',
    border: isDark === 'dark' ? '#374151' : '#e5e7eb',
    accent: isDark === 'dark' ? '#34d399' : '#10b981',
    warning: isDark === 'dark' ? '#fbbf24' : '#f59e0b',
    error: isDark === 'dark' ? '#f87171' : '#ef4444',
  };

  // Chart configuration
  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => colors.text.replace('1)', `${opacity})`),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: colors.primary,
      fill: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: colors.border,
      strokeWidth: 1,
    },
    fillShadowGradient: colors.primary,
    fillShadowGradientOpacity: 0.1,
  };

  const renderLineChart = () => {
    if (!chartData) return null;

    const data = {
      labels: chartData.dates.slice(-10), // Last 7 days
      datasets: [
        {
          data: chartData.completedData.slice(-7),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: chartData.totalData.slice(-7),
          color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          strokeWidth: 2,
          withDots: false,
        }
      ],
      legend: ["Completed", "Total Tasks"]
    };

    return (
      <LineChart
        data={data}
        width={chartWidth}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        segments={4}
      />
    );
  };

  if (!tasks || tasks.length === 0) {
    return (
      <View
        className={`mb-6 p-6 rounded-3xl ${isDark === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${isDark === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setChartWidth(width);
        }}
      >
        <View className="items-center">
          <Ionicons
            name="analytics-outline"
            size={48}
            color={isDark === 'dark' ? '#6b7280' : '#9ca3af'}
          />
          <Text className={`text-lg font-semibold mt-3 ${isDark === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            No tasks to display
          </Text>
          <Text className={`text-sm mt-1 ${isDark === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Add some tasks to see your progress
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className={`mb-6 rounded-3xl ${isDark === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${isDark === 'dark' ? 'border-gray-700' : 'border-gray-100'} shadow-sm`}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setChartWidth(width);
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center p-5 pb-2">
        <View className="flex-row items-center">
          <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isDark === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
            <MaterialIcons name="analytics" size={20} color={isDark === 'dark' ? '#34d399' : '#059669'} />
          </View>
          <View>
            <Text className={`text-lg font-bold ${isDark === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </Text>
          </View>
        </View>
      </View>

      {/* Chart */}
      <View className="flex-1 my-3">
        {renderLineChart()}
      </View>
    </View>
  );
};

export default TaskProgressChart;