import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

const PRIMARY = '#2E7D32';
const PRIMARY_LIGHT = '#DBEAFE';
const SUCCESS = '#16A34A';
const WARNING = '#F59E0B';
const DANGER = '#EF4444';
const GRAY_BG = '#F1F5F9';
const GRAY_CARD = '#F8FAFC';
const TEXT_DARK = '#0F172A';
const TEXT_SECONDARY = '#64748B';

interface Complaint {
  id: string;
  description: string;
  proofImage?: string;
  status: 'Pending' | 'Diterima' | 'Ditolak';
  createdAt: string;
}

const STORAGE_KEY = '@lokatani:complaints';

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'Diterima':
      return { bg: '#DCFCE7', text: SUCCESS, label: 'Accepted', icon: 'checkmark-circle' as const };
    case 'Ditolak':
      return { bg: '#FEE2E2', text: DANGER, label: 'Rejected', icon: 'close-circle' as const };
    default:
      return { bg: '#FEF3C7', text: '#D97706', label: 'Pending', icon: 'time' as const };
  }
};

export default function BuyerComplaints() {
  const router = useRouter();
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    proofImage: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setComplaints(JSON.parse(data));
    } catch {
      Alert.alert(t('complaint.error'), t('complaint.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const saveComplaints = async (newComplaints: Complaint[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newComplaints));
      setComplaints(newComplaints);
    } catch {
      Alert.alert(t('complaint.error'), t('complaint.saveError'));
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('complaint.permissionTitle'), t('complaint.permissionDesc'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setFormData({ ...formData, proofImage: `data:image/jpeg;base64,${result.assets[0].base64}` });
    }
  };

  const handleSubmit = async () => {
    if (!formData.description) {
      Alert.alert(t('complaint.error'), t('complaint.fillDesc'));
      return;
    }

    setSubmitting(true);
    try {
      const newComplaint: Complaint = {
        id: editingComplaint ? editingComplaint.id : Date.now().toString(),
        description: formData.description,
        proofImage: formData.proofImage || undefined,
        status: editingComplaint ? editingComplaint.status : 'Pending',
        createdAt: new Date().toISOString(),
      };

      const updated = editingComplaint
        ? complaints.map((c) => (c.id === editingComplaint.id ? newComplaint : c))
        : [...complaints, newComplaint];

      await saveComplaints(updated);
      Alert.alert('✅', editingComplaint ? t('complaint.updated') : t('complaint.sent'));
      setModalVisible(false);
      resetForm();
    } catch {
      Alert.alert(t('complaint.error'), t('complaint.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('complaint.deleteTitle'), t('complaint.deleteConfirm'), [
      { text: t('complaint.cancel'), style: 'cancel' },
      {
        text: t('complaint.delete'),
        style: 'destructive',
        onPress: async () => {
          const updated = complaints.filter((c) => c.id !== id);
          await saveComplaints(updated);
          Alert.alert('✅', t('complaint.deleted'));
        },
      },
    ]);
  };

  const openEditModal = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setFormData({
      description: complaint.description,
      proofImage: complaint.proofImage || '',
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingComplaint(null);
    setFormData({
      description: '',
      proofImage: '',
    });
  };

  const renderComplaint = ({ item }: { item: Complaint }) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <View style={styles.card}>
        {/* Status Badge */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon} size={11} color={statusInfo.text} />
            <Text style={[styles.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
          </View>
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Image */}
        {item.proofImage && (
          <Image source={{ uri: item.proofImage }} style={styles.cardImage} />
        )}

        {/* Description */}
        <Text style={styles.cardDesc} numberOfLines={3}>
          {item.description}
        </Text>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={14} color={PRIMARY} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color={DANGER} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>My Complaints</Text>
          <Text style={styles.headerSubtitle}>
            {complaints.length} {complaints.length === 1 ? 'complaint' : 'complaints'} submitted
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateModal} activeOpacity={0.85}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* List */}
      {complaints.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="chatbox-ellipses-outline" size={48} color={PRIMARY} />
          </View>
          <Text style={styles.emptyTitle}>{t('complaint.empty')}</Text>
          <Text style={styles.emptySub}>{t('complaint.emptySub')}</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={openCreateModal} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={18} color={PRIMARY} />
            <Text style={styles.emptyBtnText}>Submit a Complaint</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={complaints}
          renderItem={renderComplaint}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* === Create/Edit Modal === */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalWrap}
          >
            <View style={styles.modalCard}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="document-text" size={20} color={PRIMARY} />
                </View>
                <Text style={styles.modalTitle}>
                  {editingComplaint ? t('complaint.editTitle') : t('complaint.createTitle')}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close-circle" size={26} color={TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Upload */}
                <Text style={styles.fieldLabel}>Evidence Photo (Optional)</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.7}>
                  {formData.proofImage ? (
                    <View style={styles.imagePreviewWrap}>
                      <Image source={{ uri: formData.proofImage }} style={styles.imagePreview} />
                      <View style={styles.imageRemoveBtn}>
                        <Ionicons name="close-circle" size={20} color="#fff" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="cloud-upload-outline" size={36} color={PRIMARY} />
                      <Text style={styles.imagePlaceholderText}>Tap to upload photo</Text>
                      <Text style={styles.imagePlaceholderSub}>JPG, PNG up to 5MB</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Description */}
                <Text style={styles.fieldLabel}>Complaint Description</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe your complaint in detail..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={5}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  textAlignVertical="top"
                />

                {/* Submit */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={16} color="#fff" />
                      <Text style={styles.submitText}>
                        {editingComplaint ? t('complaint.update') : t('complaint.submit')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: GRAY_BG, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  headerSubtitle: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  addBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center',
  },

  // Empty
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: PRIMARY_LIGHT, justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK, marginTop: 16 },
  emptySub: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 20, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 14, backgroundColor: PRIMARY_LIGHT,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: PRIMARY },

  // Card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardDate: { fontSize: 12, color: TEXT_SECONDARY },
  cardImage: {
    width: '100%', height: 160, borderRadius: 12, marginBottom: 10,
  },
  cardDesc: { fontSize: 14, color: TEXT_DARK, lineHeight: 20 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: PRIMARY_LIGHT,
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: PRIMARY },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '600', color: DANGER },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalWrap: { width: '100%' },
  modalCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20,
  },
  modalIconWrap: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: TEXT_DARK },
  modalCloseBtn: { padding: 2 },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: TEXT_DARK, marginBottom: 8, marginTop: 16 },

  // Image Picker
  imagePicker: { marginBottom: 4 },
  imagePlaceholder: {
    width: '100%', height: 140, borderRadius: 14,
    backgroundColor: GRAY_BG, borderWidth: 2, borderColor: '#E2E8F0',
    borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center',
  },
  imagePlaceholderText: { fontSize: 14, fontWeight: '600', color: PRIMARY, marginTop: 8 },
  imagePlaceholderSub: { fontSize: 11, color: TEXT_SECONDARY, marginTop: 4 },
  imagePreviewWrap: { position: 'relative', borderRadius: 14, overflow: 'hidden' },
  imagePreview: { width: '100%', height: 180, borderRadius: 14 },
  imageRemoveBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },

  // Text Area
  textArea: {
    backgroundColor: GRAY_BG, borderRadius: 14, padding: 14,
    fontSize: 14, color: TEXT_DARK, minHeight: 120, lineHeight: 20,
  },

  // Submit
  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: PRIMARY, paddingVertical: 16, borderRadius: 16, marginTop: 24,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
