import React, { useState } from 'react';
import { View, Button, SafeAreaView, StyleSheet,Text, ScrollView } from 'react-native';

import BottomSheet from 'entity-bottom-sheet';

export default function Planner() {
     const [visible, setVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <Button title="Open Bottom Sheet" onPress={() => setVisible(true)} />

   <BottomSheet 
                visible={visible} 
                onClose={() => setVisible(false)}
                heightRatio={0.7}
            >
              <ScrollView className="flex-1 bg-slate-400">
                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>
                                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>
                                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>                
                <Text>This is custom content!</Text>
                <Text>You can put any views here.</Text>
              </ScrollView>
            </BottomSheet>
        
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
// import { useState } from "react";
// import { 
//   View
// } from "react-native";
// import CalendarView from "../../components/planner/CalendarView";
// import CalendarHeader from "../../components/planner/CalendarHeader";
 

// export default function Calendar() {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [viewType, setViewType] = useState("month");

//   return (
//     <View className="flex-1 p-4">
//       <CalendarHeader
//         currentDate={currentDate}
//         setCurrentDate={setCurrentDate}
//         viewType={viewType}
//         setViewType={setViewType}
//       />
//       <CalendarView currentDate={currentDate} viewType={viewType} />
//     </View>
//   );
// } 