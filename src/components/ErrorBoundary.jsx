import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { T } from '../tokens';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (__DEV__) console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={s.root}>
        <Text style={s.title}>Something went wrong</Text>
        <Text style={s.body}>Restart the app to continue. Your data is safe.</Text>
        <Pressable onPress={() => this.setState({ error: null })} style={s.btn}>
          <Text style={s.btnText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title:   { fontFamily: 'Syne_800ExtraBold', fontSize: 22, color: T.fg1, marginBottom: 10 },
  body:    { fontFamily: 'DMSans_400Regular', fontSize: 14, color: T.fg3, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  btn:     { backgroundColor: T.s2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 28, paddingVertical: 12 },
  btnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: T.fg1 },
});
