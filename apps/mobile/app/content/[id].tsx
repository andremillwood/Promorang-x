import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Linking, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type ContentDetail = {
  item: any;
  creator: any;
  moment: any;
  piece: any;
  quantity: number;
};

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      const itemResult = await supabase.from('content_items').select('*').eq('id', id).maybeSingle();
      const item: any = itemResult.data;
      if (!item) { if (active) { setData(null); setLoading(false); } return; }
      const [creatorResult, linkResult, pieceResult, positionResult] = await Promise.all([
        item.creator_id ? supabase.from('profiles').select('id,display_name,username,avatar_url').eq('id', item.creator_id).maybeSingle() : Promise.resolve({ data: null }),
        supabase.from('content_moment_links').select('moments:moment_id(id,title,location,image_url,starts_at)').eq('content_item_id', id).limit(1).maybeSingle(),
        supabase.from('content_piece_stats').select('current_price,change_24h,volume_24h').eq('content_id', id).maybeSingle(),
        user ? supabase.from('content_piece_positions').select('pieces_owned').eq('content_id', id).eq('holder_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      if (active) setData({ item, creator: creatorResult.data, moment: (linkResult.data as any)?.moments || null, piece: pieceResult.data, quantity: Number(positionResult.data?.pieces_owned || 0) });
      if (active) setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [id, user]);

  if (loading) return <View style={s.state}><ActivityIndicator color={Colors.primary}/><Text style={s.stateText}>Opening content…</Text></View>;
  if (!data) return <View style={s.state}><Text style={s.missing}>Content unavailable</Text><Pressable style={s.primary} onPress={() => router.replace('/discover')}><Text style={s.primaryText}>Return to Discover</Text></Pressable></View>;
  const { item, creator, moment, piece, quantity } = data;
  const metadata = item.media_metadata || {};
  const originalUrl = metadata.original_url || metadata.source_url || metadata.external_url || null;

  return <View style={s.screen}><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ImageBackground source={item.media_url ? { uri: item.media_url } : undefined} style={s.hero} imageStyle={s.heroRadius}>
      <View style={s.shade}/><View style={s.nav}><Pressable style={s.round} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={Colors.white}/></Pressable><Pressable style={s.round} onPress={() => router.push({ pathname:'/report', params:{targetType:'content',targetId:id,title:item.title || ''} } as any)}><Ionicons name="ellipsis-horizontal" size={21} color={Colors.white}/></Pressable></View>
      <View style={s.heroCopy}><Text style={s.platform}>{String(item.platform || 'PROMORANG').toUpperCase()}</Text><Text style={s.title}>{item.title || 'Shared content'}</Text><Text style={s.description}>{item.description || 'A story moving through Promorang.'}</Text></View>
    </ImageBackground>
    <View style={s.body}>
      <Text style={s.eyebrow}>WHERE THIS CONTENT LIVES</Text><Text style={s.heading}>The story and everything connected to it.</Text>
      {originalUrl ? <Pressable style={s.original} onPress={() => Linking.openURL(originalUrl)}><View><Text style={s.cardLabel}>ORIGINAL SOURCE</Text><Text style={s.cardTitle}>Open where it was published</Text></View><Ionicons name="open-outline" size={20} color={Colors.black}/></Pressable> : <View style={s.quietCard}><Text style={s.cardLabel}>ORIGINAL SOURCE</Text><Text style={s.quietText}>The publisher has not attached an external source link.</Text></View>}
      {moment ? <Pressable style={s.contextCard} onPress={() => router.push(`/moment/${moment.id}` as any)}><Ionicons name="location" size={20} color={Colors.primary}/><View style={s.cardCopy}><Text style={s.cardLabel}>ASSOCIATED MOMENT</Text><Text style={s.darkTitle}>{moment.title}</Text><Text style={s.quietText}>{moment.location || 'Open the Moment'}</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.gray[500]}/></Pressable> : null}
      <View style={s.contextCard}><Ionicons name="person" size={20} color={Colors.primary}/><View style={s.cardCopy}><Text style={s.cardLabel}>CREATOR</Text><Text style={s.darkTitle}>{creator?.display_name || creator?.username || 'Promorang creator'}</Text><Text style={s.quietText}>Attributed to the person who made it.</Text></View></View>
      <Pressable style={s.pieceCard} onPress={() => router.push(`/pieces/content/${id}` as any)}><View><Text style={s.pieceLabel}>CONTENT PIECE</Text><Text style={s.pieceTitle}>{quantity} owned</Text><Text style={s.pieceDetail}>Track ownership and price movement</Text></View><View style={s.priceCopy}><Text style={s.price}>{piece?.current_price == null ? 'Open' : `$${Number(piece.current_price).toFixed(2)}`}</Text>{piece?.change_24h != null ? <Text style={s.change}>{Number(piece.change_24h) >= 0 ? '+' : ''}{Number(piece.change_24h).toFixed(1)}%</Text> : null}</View></Pressable>
      <Pressable style={s.promoshare} onPress={() => router.push('/promoshare')}><View><Text style={s.cardLabel}>PROMOSHARE</Text><Text style={s.darkTitle}>See what this story helped move</Text><Text style={s.quietText}>Attributed discovery, joins, visits and purchases stay connected.</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.gray[500]}/></Pressable>
    </View><View style={{height:80}}/></ScrollView></View>;
}

const s=StyleSheet.create({screen:{flex:1,backgroundColor:Colors.black},content:{backgroundColor:Colors.black},state:{flex:1,alignItems:'center',justifyContent:'center',gap:10,padding:30,backgroundColor:Colors.black},stateText:{color:Colors.gray[500]},missing:{color:Colors.white,fontSize:24,fontWeight:'900'},primary:{marginTop:12,paddingHorizontal:15,paddingVertical:11,borderRadius:18,backgroundColor:Colors.primary},primaryText:{color:Colors.black,fontWeight:'900'},hero:{height:570,paddingTop:54,paddingHorizontal:Spacing.container,justifyContent:'space-between'},heroRadius:{},shade:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,.48)'},nav:{flexDirection:'row',justifyContent:'space-between',backgroundColor:'transparent'},round:{width:42,height:42,borderRadius:21,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,.7)',borderWidth:1,borderColor:'rgba(255,255,255,.16)'},heroCopy:{paddingBottom:28,backgroundColor:'transparent'},platform:{color:Colors.primary,fontFamily:'SpaceMono',fontSize:11,letterSpacing:1},title:{color:Colors.white,fontSize:40,lineHeight:43,fontWeight:'900',letterSpacing:-1.3,marginTop:8},description:{color:Colors.gray[200],fontSize:13,lineHeight:20,marginTop:10},body:{paddingHorizontal:Spacing.container,backgroundColor:Colors.black},eyebrow:{color:Colors.primary,fontFamily:'SpaceMono',fontSize:11,letterSpacing:.8,marginTop:25},heading:{color:Colors.white,fontSize:27,lineHeight:30,fontWeight:'900',marginTop:7},original:{minHeight:76,marginTop:18,padding:15,borderRadius:BorderRadius.xl,backgroundColor:Colors.primary,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},cardLabel:{color:Colors.primary,fontFamily:'SpaceMono',fontSize:9,letterSpacing:.7},cardTitle:{color:Colors.black,fontSize:14,fontWeight:'900',marginTop:4},quietCard:{marginTop:18,padding:15,borderRadius:BorderRadius.xl,backgroundColor:Colors.gray[900],borderWidth:1,borderColor:Colors.border},quietText:{color:Colors.gray[500],fontSize:11,lineHeight:16,marginTop:4},contextCard:{marginTop:10,padding:15,borderRadius:BorderRadius.xl,backgroundColor:Colors.gray[900],borderWidth:1,borderColor:Colors.border,flexDirection:'row',alignItems:'center',gap:12},cardCopy:{flex:1,backgroundColor:'transparent'},darkTitle:{color:Colors.white,fontSize:13,fontWeight:'900',marginTop:4},pieceCard:{marginTop:10,padding:16,borderRadius:BorderRadius.xl,backgroundColor:'#f4ead8',flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between'},pieceLabel:{color:Colors.primary,fontFamily:'SpaceMono',fontSize:9,letterSpacing:.7},pieceTitle:{color:'#17130f',fontSize:24,fontWeight:'900',marginTop:5},pieceDetail:{color:'rgba(0,0,0,.5)',fontSize:10,marginTop:3},priceCopy:{alignItems:'flex-end',backgroundColor:'transparent'},price:{color:Colors.primary,fontSize:19,fontWeight:'900'},change:{color:'rgba(0,0,0,.5)',fontSize:11,marginTop:3},promoshare:{marginTop:10,padding:16,borderRadius:BorderRadius.xl,backgroundColor:Colors.gray[900],borderWidth:1,borderColor:Colors.border,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}});
