import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface StoryItem {
  id: string;
  merchantName: string;
  merchantLogo?: string;
  mediaUrl: string;
  dealTitle: string;
  dealDiscount: string;
  expiresIn: string;
  claimedCount?: number;
}

interface DealStoryPlayerProps {
  visible: boolean;
  stories: StoryItem[];
  initialIndex?: number;
  onClose: () => void;
  onClaimDeal: (story: StoryItem) => void;
}

const STORY_DURATION_MS = 5000;

export function DealStoryPlayer({
  visible,
  stories,
  initialIndex = 0,
  onClose,
  onClaimDeal,
}: DealStoryPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const activeStory = stories[currentIndex] || stories[0];

  useEffect(() => {
    if (visible && stories.length > 0) {
      startProgress();
    }
    return () => {
      progressAnim.stopAnimation();
    };
  }, [visible, currentIndex]);

  const startProgress = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        handleNext();
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTap = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    if (x < SCREEN_WIDTH * 0.3) {
      handlePrevious();
    } else {
      handleNext();
    }
  };

  if (!visible || !activeStory) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.container}>
        {/* Story Backdrop Media */}
        <Image
          source={{ uri: activeStory.mediaUrl }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.overlayGradient} />

        {/* Tap gesture overlay */}
        <Pressable style={styles.tapArea} onPress={handleTap} />

        {/* Header Progress Bars */}
        <View style={styles.headerContainer}>
          <View style={styles.progressRow}>
            {stories.map((story, idx) => {
              const isCurrent = idx === currentIndex;
              const isPast = idx < currentIndex;
              return (
                <View key={story.id} style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: isPast
                          ? '100%'
                          : isCurrent
                          ? progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            })
                          : '0%',
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>

          {/* Merchant Profile Overlay */}
          <View style={styles.merchantHeader}>
            <Image
              source={{
                uri:
                  activeStory.merchantLogo ||
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100',
              }}
              style={styles.merchantAvatar}
            />
            <View style={styles.merchantMeta}>
              <Text style={styles.merchantName}>{activeStory.merchantName}</Text>
              <Text style={styles.expiresText}>Expires in {activeStory.expiresIn}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Bottom Snapchat-Style CTA Pill */}
        <View style={styles.footerContainer}>
          <View style={styles.dealBadge}>
            <Text style={styles.dealDiscount}>{activeStory.dealDiscount}</Text>
            <Text style={styles.dealTitle}>{activeStory.dealTitle}</Text>
          </View>

          <Pressable
            style={styles.claimButton}
            onPress={() => onClaimDeal(activeStory)}
          >
            <Ionicons name="flash" size={20} color="#000" />
            <Text style={styles.claimButtonText}>Swipe Up / Tap to Lock In</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 48,
    left: 12,
    right: 12,
    zIndex: 2,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  merchantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  merchantMeta: {
    marginLeft: 10,
    flex: 1,
  },
  merchantName: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  expiresText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
  },
  closeButton: {
    padding: 6,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    zIndex: 2,
    alignItems: 'center',
  },
  dealBadge: {
    backgroundColor: 'rgba(15, 15, 15, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    width: '100%',
  },
  dealDiscount: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  dealTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
    gap: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  claimButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
