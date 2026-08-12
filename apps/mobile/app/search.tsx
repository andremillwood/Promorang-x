import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';

type Result = { id: string; title: string; detail: string; kind: 'moment' | 'person' | 'content' };

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true); setError(null);
      const pattern = `%${term.replace(/[%_]/g, '')}%`;
      const [moments, people, content] = await Promise.all([
        supabase.from('moments').select('id,title,location').or(`title.ilike.${pattern},location.ilike.${pattern}`).limit(8),
        supabase.from('users').select('id,display_name,username').or(`display_name.ilike.${pattern},username.ilike.${pattern}`).limit(8),
        supabase.from('content_items').select('id,title,description').or(`title.ilike.${pattern},description.ilike.${pattern}`).limit(8),
      ]);
      const queryError = moments.error || people.error || content.error;
      if (queryError) setError(queryError.message);
      setResults([
        ...(moments.data || []).map((item) => ({ id: item.id, title: item.title, detail: item.location || 'Moment', kind: 'moment' as const })),
        ...(people.data || []).map((item) => ({ id: item.id, title: item.display_name || item.username || 'Promorang member', detail: item.username ? `@${item.username}` : 'Person', kind: 'person' as const })),
        ...(content.data || []).map((item) => ({ id: item.id, title: item.title || 'Shared content', detail: item.description || 'From the community', kind: 'content' as const })),
      ]);
      setLoading(false);
    }, 320);
    return () => clearTimeout(timer);
  }, [query]);

  const open = (result: Result) => {
    if (result.kind === 'moment') router.push(`/moment/${result.id}` as any);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable>
        <View style={styles.search}><Ionicons name="search" size={19} color={Colors.gray[400]} /><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Moments, people, content…" placeholderTextColor={Colors.gray[500]} style={styles.input} />{query && <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={19} color={Colors.gray[500]} /></Pressable>}</View>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {query.trim().length < 2 ? <>
          <Text style={styles.eyebrow}>TRENDING AROUND YOU</Text>
          {['Live tonight', 'Dancehall', 'Food near me', 'Action prompts', 'Art walks'].map((term, index) => <Pressable key={term} style={styles.trend} onPress={() => setQuery(term)}><Text style={styles.number}>0{index + 1}</Text><Text style={styles.trendText}>{term}</Text><Ionicons name="arrow-up" size={15} color={Colors.gray[500]} style={{ transform: [{ rotate: '45deg' }] }} /></Pressable>)}
        </> : loading ? <State icon="search" text="Searching the scene…" loading /> : error ? <State icon="cloud-offline-outline" text={error} /> : results.length === 0 ? <State icon="compass-outline" text={`Nothing matches “${query}”`} /> : <>
          <View style={styles.resultHead}><Text style={styles.eyebrow}>RESULTS</Text><Text style={styles.count}>{results.length} found</Text></View>
          <View style={styles.list}>{results.map((result) => <Pressable key={`${result.kind}-${result.id}`} style={styles.result} onPress={() => open(result)}><View style={styles.resultIcon}><Ionicons name={result.kind === 'moment' ? 'flash' : result.kind === 'person' ? 'person' : 'images'} size={20} color={Colors.primary} /></View><View style={styles.resultCopy}><Text style={styles.kind}>{result.kind.toUpperCase()}</Text><Text style={styles.resultTitle}>{result.title}</Text><Text style={styles.detail} numberOfLines={1}>{result.detail}</Text></View>{result.kind === 'moment' && <Ionicons name="chevron-forward" size={18} color={Colors.gray[600]} />}</Pressable>)}</View>
        </>}
      </ScrollView>
    </View>
  );
}

function State({ icon, text, loading }: { icon: any; text: string; loading?: boolean }) {
  return <View style={styles.state}>{loading ? <ActivityIndicator color={Colors.primary} /> : <Ionicons name={icon} size={34} color={Colors.gray[500]} />}<Text style={styles.stateText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 13, flexDirection: 'row', gap: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: Colors.black },
  back: { width: 42, height: 45, borderRadius: 21, backgroundColor: Colors.gray[900], alignItems: 'center', justifyContent: 'center' },
  search: { flex: 1, height: 45, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 15, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, height: '100%', color: Colors.white, fontSize: 14 },
  content: { padding: Spacing.container },
  eyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1 },
  trend: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: 'transparent' },
  number: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, width: 34 },
  trendText: { color: Colors.white, fontSize: 14, fontWeight: '700', flex: 1 },
  state: { minHeight: 380, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'transparent' },
  stateText: { color: Colors.gray[400], fontSize: 12, textAlign: 'center', maxWidth: 300 },
  resultHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, backgroundColor: 'transparent' },
  count: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12 },
  list: { overflow: 'hidden', borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  result: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: 'transparent' },
  resultIcon: { width: 45, height: 45, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  resultCopy: { flex: 1, backgroundColor: 'transparent' },
  kind: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  resultTitle: { color: Colors.white, fontSize: 12, fontWeight: '800', marginTop: 3 },
  detail: { color: Colors.gray[500], fontSize: 12, marginTop: 3 },
});
