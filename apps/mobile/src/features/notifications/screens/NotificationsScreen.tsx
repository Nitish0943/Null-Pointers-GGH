import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';
import {
  BottomNavigation,
  type PrimaryTab,
} from '../../../shared/components/navigation/BottomNavigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

type Notification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: string;
  color: string;
};

const notifications: Notification[] = [
  {
    id: 'assessment',
    title: 'Your assessment is ready',
    detail: 'Take a few minutes to understand your strengths.',
    time: 'Today',
    icon: '✦',
    color: '#6366F1',
  },
  {
    id: 'profile',
    title: 'Complete your student profile',
    detail: 'Add your interests to get more relevant guidance.',
    time: 'Yesterday',
    icon: '◎',
    color: '#0F766E',
  },
  {
    id: 'roadmap',
    title: 'New pathways to explore',
    detail: 'Three technology pathways match your interests.',
    time: '2 days ago',
    icon: '↗',
    color: '#C26A1B',
  },
];

export function NotificationsScreen({ navigation }: Props) {
  const [readIds, setReadIds] = useState<string[]>([]);
  const unreadCount = notifications.filter(
    (notification) => !readIds.includes(notification.id),
  ).length;

  function markAllRead() {
    setReadIds(notifications.map((notification) => notification.id));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to home"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>STAY IN THE LOOP</Text>
            <Text style={styles.title}>Notifications</Text>
          </View>
          {unreadCount > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
              onPress={markAllRead}
              style={styles.readButton}
            >
              <Text style={styles.readText}>Mark read</Text>
            </Pressable>
          ) : (
            <View style={styles.readButtonPlaceholder} />
          )}
        </View>

        <Text style={styles.summary}>
          {unreadCount
            ? `${unreadCount} updates waiting for you`
            : 'You’re all caught up'}
        </Text>

        <View style={styles.list}>
          {notifications.map((notification) => {
            const isRead = readIds.includes(notification.id);
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${notification.title}, ${isRead ? 'read' : 'unread'}`}
                key={notification.id}
                onPress={() =>
                  setReadIds((ids) =>
                    ids.includes(notification.id)
                      ? ids
                      : [...ids, notification.id],
                  )
                }
                style={({ pressed }) => [
                  styles.notification,
                  !isRead && styles.notificationUnread,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: `${notification.color}18` },
                  ]}
                >
                  <Text
                    style={[styles.iconText, { color: notification.color }]}
                  >
                    {notification.icon}
                  </Text>
                </View>
                <View style={styles.notificationCopy}>
                  <View style={styles.notificationTitleRow}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    {!isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationDetail}>
                    {notification.detail}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.emptyHint}>
          <Text style={styles.emptyHintIcon}>✓</Text>
          <Text style={styles.emptyHintText}>
            We’ll keep important guidance and opportunities here.
          </Text>
        </View>
      </ScrollView>
      <BottomNavigation
        activeTab="Home"
        onTabPress={(tab: PrimaryTab) => navigation.navigate(tab)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7FAFC', flex: 1 },
  container: { padding: 20, paddingBottom: 32 },
  header: { alignItems: 'center', flexDirection: 'row', minHeight: 58 },
  backButton: { padding: 8 },
  backArrow: { color: '#17324D', fontSize: 27 },
  headerCopy: { flex: 1, marginLeft: 8 },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: { color: '#17324D', fontSize: 27, fontWeight: '800', marginTop: 5 },
  readButton: { padding: 8 },
  readButtonPlaceholder: { height: 34, width: 70 },
  readText: { color: '#0F766E', fontSize: 11, fontWeight: '800' },
  summary: { color: '#6B8193', fontSize: 14, marginTop: 24 },
  list: { gap: 10, marginTop: 18 },
  notification: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
  },
  notificationUnread: { borderColor: '#B9DCD8', backgroundColor: '#FCFFFE' },
  notificationIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    marginRight: 12,
    width: 46,
  },
  iconText: { fontSize: 23, fontWeight: '700' },
  notificationCopy: { flex: 1 },
  notificationTitleRow: { alignItems: 'center', flexDirection: 'row' },
  notificationTitle: {
    color: '#17324D',
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  unreadDot: {
    backgroundColor: '#0F766E',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  notificationDetail: {
    color: '#6B8193',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  notificationTime: { color: '#9AAAB5', fontSize: 10, marginTop: 8 },
  pressed: { opacity: 0.78 },
  emptyHint: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderRadius: 12,
    flexDirection: 'row',
    marginTop: 24,
    padding: 14,
  },
  emptyHintIcon: {
    color: '#0F766E',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 10,
  },
  emptyHintText: { color: '#376E6A', flex: 1, fontSize: 12, lineHeight: 18 },
});
