// ChatScreen.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Replace this with your Botpress shareable link
const BOTPRESS_URL = 'https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2025/02/05/18/20250205180409-ECKAVYIS.json';

const ChatScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: BOTPRESS_URL }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
  },
  webview: {
    flex: 1,
  },
});

export default ChatScreen;
