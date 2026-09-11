export type UserRole = 'ADMIN' | 'DOCTOR' | 'CHW' | 'PATIENT' | 'PHARMACIST' | 'STAFF';
export type TriageStatus = 'CRITICAL' | 'NON_CRITICAL';
export type ConsultationStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PrescriptionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type TreatmentPlanStatus = 'ACTIVE' | 'COMPLETED';
export type NotificationType =
  | 'EMERGENCY_ALERT'
  | 'PRESCRIPTION_READY'
  | 'APPOINTMENT_REMINDER'
  | 'LOW_STOCK'
  | 'ASSIGNMENT';
export type StockAction = 'ADD' | 'REDUCE' | 'SET';
export type DispenseStatus = 'PENDING' | 'PARTIAL' | 'DISPENSED';
export type ReferralUrgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY';
export type ReferralStatus = 'PENDING' | 'ACKNOWLEDGED' | 'COMPLETED' | 'CANCELLED';
export type DiaryMood = 'BETTER' | 'SAME' | 'WORSE';
export type VisitOutcome =
  | 'ROUTINE_CHECK'
  | 'TRIAGE_DONE'
  | 'REFERRED'
  | 'NOT_HOME'
  | 'FOLLOW_UP_NEEDED';
export type AuditAction =
  | 'VIEW'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'DISPENSE';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isPublic?: boolean;
  isActive?: boolean;
  profileImage?: string | null;
  createdAt?: string;
}

export interface PublicDoctor {
  id: number;
  fullName: string;
  profileImage?: string | null;
  doctorId: number;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  bio?: string;
}

export interface PublicChw {
  id: number;
  fullName: string;
  profileImage?: string | null;
  assignedArea: string;
  activeSince?: string;
}

export interface PublicStaff {
  id: number;
  fullName: string;
  profileImage?: string | null;
  department: string;
  designation: string;
}

export interface Patient {
  id: number;
  mrn: string;
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  phone: string;
  altPhone?: string;
  address: string;
  village?: string;
  district?: string;
  emergencyContactName: string;
  emergencyContactRelation?: string;
  emergencyContactPhone: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  user?: User | null;
  registeredBy?: User;
  createdAt?: string;
}

export interface PatientCredentials {
  email: string;
  tempPassword: string;
}

export interface CreatePatientResult {
  patient: Patient;
  credentials: PatientCredentials;
}
export interface VitalSigns {
  id: number;
  patient?: Patient;
  temperature: number;
  bpSystolic: number;
  bpDiastolic: number;
  pulse: number;
  spo2: number;
  respiratoryRate?: number;
  bloodSugar?: number;
  recordedBy?: User;
  recordedAt: string;
  warnings?: string[];
  suggestedTriage?: TriageStatus;
}

export interface SymptomReport {
  id: number;
  patient?: Patient;
  vitalSign?: VitalSigns | null;
  primaryComplaint: string;
  symptoms: string[];
  duration?: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  triageStatus: TriageStatus;
  suggestedStatus?: TriageStatus | null;
  notes?: string;
  recordedBy?: User;
  recordedAt: string;
}

export interface ChatMessage {
  id: number;
  consultationId: number;
  sender: { id: number; name: string; role: UserRole };
  message: string;
  sentAt: string;
}

export interface Consultation {
  id: number;
  patient: Patient;
  doctor: User;
  scheduledBy?: User;
  scheduledAt: string;
  reason: string;
  status: ConsultationStatus;
  diagnosis?: string;
  doctorNotes?: string;
  completedAt?: string;
  messages?: ChatMessage[];
}

export interface Medicine {
  id: number;
  brandName: string;
  genericName: string;
  manufacturer?: string;
  dosageForm: string;
  strength: string;
  therapeuticClass?: string;
  isAvailable: boolean;
  inventory?: MedicineInventory;
}

export interface MedicineInventory {
  id: number;
  medicine?: Medicine;
  stockQty: number;
  threshold: number;
  updatedAt?: string;
}

export interface PrescriptionItem {
  id: number;
  medicine: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions?: string;
}

export interface Prescription {
  id: number;
  patient: Patient;
  doctor: User;
  consultation?: Consultation | null;
  status: PrescriptionStatus;
  doctorNotes?: string;
  dispenseStatus: DispenseStatus;
  dispensedAt?: string | null;
  cancelReason?: string;
  cancelledAt?: string | null;
  issuedAt: string;
  items: PrescriptionItem[];
}

export interface DispenseRecord {
  id: number;
  medicine: Medicine;
  quantity: number;
  dispensedBy?: User;
  notes?: string;
  dispensedAt: string;
}

export interface DispenseHistory {
  prescriptionId: number;
  dispenseStatus: DispenseStatus;
  dispensedAt?: string | null;
  records: DispenseRecord[];
  /** Prescribed items with nothing dispensed against them yet. */
  outstanding: PrescriptionItem[];
}

export interface TreatmentPlan {
  id: number;
  patient: Patient;
  doctor: User;
  title: string;
  details: string;
  startDate: string;
  endDate: string;
  status: TreatmentPlanStatus;
  createdAt: string;
}

export interface Appointment {
  id: number;
  patient: Patient;
  doctor: User;
  scheduledAt: string;
  type: string;
  status: AppointmentStatus;
  cancelReason?: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  refId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface Referral {
  id: number;
  patient: Patient;
  referredBy: User;
  consultation?: Consultation | null;
  facilityName: string;
  facilityType?: string;
  department?: string;
  reason: string;
  clinicalSummary?: string;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldVisit {
  id: number;
  patient: Patient;
  chw: User;
  visitDate: string;
  outcome: VisitOutcome;
  notes?: string;
  village?: string;
  travelMinutes?: number;
  followUpNeeded: boolean;
  createdAt: string;
}

export interface VisitStats {
  days: number;
  totalVisits: number;
  uniquePatients: number;
  followUpsPending: number;
  byOutcome: Record<string, number>;
  byVillage: Record<string, number>;
  travelMinutes: number;
}

export interface DiaryEntry {
  id: number;
  patient?: Patient;
  recordedBy?: User | null;
  note: string;
  symptoms?: string[];
  mood: DiaryMood;
  painLevel?: number;
  medicationTaken: boolean;
  createdAt: string;
}

export interface DiarySummary {
  days: number;
  entryCount: number;
  moodCounts: Record<DiaryMood, number>;
  averagePain: number | null;
  adherenceRate: number | null;
  latest: DiaryEntry | null;
}

export interface TemplateItem {
  id: number;
  medicine: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions?: string;
}

export interface PrescriptionTemplate {
  id: number;
  doctor?: User;
  name: string;
  condition?: string;
  notes?: string;
  isShared: boolean;
  useCount: number;
  items: TemplateItem[];
  createdAt: string;
}

/** What POST /prescription-templates/:id/apply hands back, ready to prefill a prescription. */
export interface AppliedTemplate {
  templateId: number;
  name: string;
  notes?: string;
  items: {
    medicineId: number;
    medicine: Medicine;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    instructions?: string;
  }[];
}

export interface AvailabilitySlot {
  id: number;
  /** 0 = Sunday. */
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  isActive: boolean;
}

export interface TimeOff {
  id: number;
  date: string;
  reason?: string;
}

export interface DoctorAvailability {
  slots: AvailabilitySlot[];
  timeOff: TimeOff[];
}

export interface DaySlots {
  date: string;
  slots: string[];
  /** Set when the doctor is unavailable that day. */
  reason?: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
  category: string;
  updatedAt?: string;
}

export interface PublicSettings {
  platformName: string;
  announcement: string;
  supportEmail: string;
}

export interface TriageThresholds {
  spo2Critical: number;
  spo2Warning: number;
  systolicHigh: number;
  systolicLow: number;
  temperatureCritical: number;
  temperatureWarning: number;
  pulseCritical: number;
  pulseWarning: number;
}

export interface AuditLog {
  id: number;
  actor?: User | null;
  actorEmail?: string;
  actorRole?: string;
  action: AuditAction;
  resource: string;
  resourceId?: number;
  detail?: string;
  ip?: string;
  createdAt: string;
}

export interface AuditPage {
  items: AuditLog[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminStats {
  periodDays: number;
  users: { total: number; doctors: number; chws: number; pharmacists: number };
  patients: { total: number; newInPeriod: number };
  consultations: { total: number; inPeriod: number };
  prescriptions: { total: number; inPeriod: number };
  medicines: { total: number; lowStock: number };
  criticalReports: number;
  byDistrict: { district: string; count: number }[];
}

export interface DoctorStats {
  periodDays: number;
  consultations: {
    today: number;
    total: number;
    completed: number;
    pendingDiagnosis: number;
  };
  prescriptions: { total: number; inPeriod: number };
  uniquePatients: number;
}

export interface ChwStats {
  periodDays: number;
  patients: { total: number; newInPeriod: number };
  consultationsScheduled: number;
  criticalAwaitingConsultation: number;
}

export interface PharmacistStats {
  periodDays: number;
  medicines: { total: number; lowStock: number; outOfStock: number };
  dispensing: { pending: number; completedInPeriod: number };
  unitsInStock: number;
}

export interface PatientStats {
  mrn: string;
  consultations: number;
  prescriptions: { total: number; active: number };
}
