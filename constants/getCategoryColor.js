// Category color helper function
export const getCategoryColor = (category, isDark) => {
  const colors = {
    'Work': { 
      bg: isDark ? 'bg-blue-900/30' : 'bg-blue-100', 
      text: isDark ? 'text-blue-400' : 'text-blue-700' 
    },
    'Personal': { 
      bg: isDark ? 'bg-green-900/30' : 'bg-green-100', 
      text: isDark ? 'text-green-400' : 'text-green-700' 
    },
    'Study': { 
      bg: isDark ? 'bg-purple-900/30' : 'bg-purple-100', 
      text: isDark ? 'text-purple-400' : 'text-purple-700' 
    },
    'Health': { 
      bg: isDark ? 'bg-red-900/30' : 'bg-red-100', 
      text: isDark ? 'text-red-400' : 'text-red-700' 
    },
    'Finance': { 
      bg: isDark ? 'bg-yellow-900/30' : 'bg-yellow-100', 
      text: isDark ? 'text-yellow-400' : 'text-yellow-700' 
    },
    'default': { 
      bg: isDark ? 'bg-gray-700' : 'bg-gray-100', 
      text: isDark ? 'text-gray-300' : 'text-gray-700' 
    }
  };
  return colors[category] || colors.default;
};
