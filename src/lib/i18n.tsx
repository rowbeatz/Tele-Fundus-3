import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ja';

interface Translations {
  [key: string]: {
    en: string;
    ja: string;
  };
}

const translations: Translations = {
  'nav.dashboard': { en: 'Dashboard', ja: 'ダッシュボード' },
  'nav.register': { en: 'New Screening', ja: '症例登録' },
  'nav.queue': { en: 'Reading Queue', ja: '読影キュー' },
  'nav.billing': { en: 'Billing & Payouts', ja: '会計・収支' },
  'nav.settings': { en: 'Settings', ja: '設定' },
  'nav.logout': { en: 'Logout', ja: 'ログアウト' },
  'app.title': { en: 'Tele-Fundus', ja: '遠隔眼底診断' },
  'app.subtitle': { en: 'Diagnostic Platform', ja: '診断プラットフォーム' },
  
  'dashboard.title': { en: 'System Overview', ja: 'システム概要' },
  'dashboard.subtitle': { en: 'Real-time monitoring and operational control', ja: 'リアルタイム監視と運用管理' },
  'dashboard.new_screening': { en: 'New Screening', ja: '新規症例登録' },
  'dashboard.stat.total': { en: 'Total Screenings', ja: '総症例数' },
  'dashboard.stat.pending': { en: 'Pending Action', ja: '未処理' },
  'dashboard.stat.completed': { en: 'Completed', ja: '完了' },
  'dashboard.stat.physicians': { en: 'Active Physicians', ja: '稼働医師数' },
  
  'table.patient_id': { en: 'Patient ID', ja: '受診者ID' },
  'table.name': { en: 'Name', ja: '氏名' },
  'table.organization': { en: 'Organization', ja: '依頼元機関' },
  'table.date': { en: 'Date', ja: '撮影日' },
  'table.status': { en: 'Status', ja: 'ステータス' },
  'table.urgency': { en: 'Urgency', ja: '至急' },
  'table.assigned_to': { en: 'Assigned To', ja: '担当医' },
  'table.action': { en: 'Action', ja: 'アクション' },
  
  'status.pending': { en: 'Pending', ja: '未割当' },
  'status.in_reading': { en: 'In Reading', ja: '読影中' },
  'status.qc_review': { en: 'QC Review', ja: 'QC確認待ち' },
  'status.completed': { en: 'Completed', ja: '完了' },
  'status.urgent': { en: 'Urgent', ja: '至急' },
  
  'action.assign': { en: 'Assign Doctor...', ja: '医師を割当...' },
  'action.qc_review': { en: 'QC Review', ja: 'QC確認' },
  'action.open_viewer': { en: 'Open Viewer', ja: 'ビューアを開く' },
  
  'settings.title': { en: 'Settings', ja: '設定' },
  'settings.subtitle': { en: 'Manage users and platform configurations', ja: 'ユーザーとプラットフォーム設定の管理' },
  'settings.users': { en: 'User Management', ja: 'ユーザー管理' },
  'settings.add_user': { en: 'Add User', ja: 'ユーザー追加' },
  'settings.role': { en: 'Role', ja: '権限' },
  
  'register.title': { en: 'New Screening Registration', ja: '新規症例登録' },
  'register.subtitle': { en: 'Upload fundus images and patient clinical data', ja: '眼底画像と臨床データの登録' },
  'register.patient_info': { en: 'Patient Information', ja: '受診者情報' },
  'register.clinical_data': { en: 'Clinical Data', ja: '臨床データ' },
  'register.bp': { en: 'Blood Pressure', ja: '血圧' },
  'register.diabetes': { en: 'Diabetes', ja: '糖尿病' },
  'register.hypertension': { en: 'Hypertension', ja: '高血圧' },
  
  'viewer.title': { en: 'Diagnostic Viewer', ja: '読影ビューア' },
  'viewer.patient_panel': { en: 'Patient Profile', ja: '受診者プロフィール' },
  'viewer.findings': { en: 'Findings & Diagnosis', ja: '所見・診断' },
  'viewer.judgment': { en: 'Judgment Code', ja: '判定区分' },
  'viewer.findings_right': { en: 'Findings (Right)', ja: '所見 (右眼)' },
  'viewer.findings_left': { en: 'Findings (Left)', ja: '所見 (左眼)' },
  'viewer.referral': { en: 'Referral Recommended', ja: '紹介要' },
  'viewer.retest': { en: 'Re-test Recommended', ja: '再検要' },
  'viewer.comment': { en: 'Physician Comment', ja: '医師コメント' },
  'viewer.comparison': { en: 'Comparison Mode', ja: '比較モード' },
  'viewer.rotate': { en: 'Rotate', ja: '回転' },
  
  'viewer.diagnostic_report': { en: 'Diagnostic Report', ja: '診断レポート' },
  'viewer.case_thread': { en: 'Case Thread', ja: '症例スレッド' },
  'viewer.patient_record': { en: 'Patient Record', ja: '受診者記録' },
  'viewer.findings_placeholder': { en: 'Enter clinical observations...', ja: '臨床所見を入力してください...' },
  'viewer.reject': { en: 'Reject', ja: '差戻し' },
  'viewer.approve_complete': { en: 'Approve & Complete', ja: '承認・完了' },
  'viewer.submit_report': { en: 'Submit Diagnostic Report', ja: '診断レポートを提出' },
  'viewer.reject_reason': { en: 'Reason for Rejection', ja: '差戻し理由' },
  'viewer.reject_reason_placeholder': { en: 'Please specify why this case is being rejected...', ja: '差戻しの理由を具体的に入力してください...' },
  'viewer.reject_title': { en: 'Reject Screening', ja: '症例の差戻し' },
  'viewer.reject_subtitle': { en: 'Please provide a reason for rejection.', ja: '差戻しの理由を入力してください。' },
  'viewer.qc_checklist.title': { en: 'Rejection Checklist', ja: '差戻しチェックリスト' },
  'viewer.qc_checklist.od_os_match': { en: 'OD/OS Match', ja: '左右眼の整合性' },
  'viewer.qc_checklist.required_fields': { en: 'Required Fields', ja: '必須項目の入力' },
  'viewer.qc_checklist.judgment_match': { en: 'Judgment Match', ja: '判定区分の整合性' },
  'viewer.qc_checklist.format_compliance': { en: 'Format Compliance', ja: 'フォーマット準拠' },
  'viewer.qc_feedback_label': { en: 'Feedback for Physician', ja: '医師へのフィードバック' },
  'viewer.gender': { en: 'Gender', ja: '性別' },
  'viewer.birth_date': { en: 'Birth Date', ja: '生年月日' },
  'viewer.chief_complaint': { en: 'Chief Complaint', ja: '主訴' },
  'viewer.clinical_history': { en: 'Clinical History', ja: '既往歴' },
  'viewer.no_data': { en: 'No data', ja: 'データなし' },
  'viewer.no_history': { en: 'No significant history reported.', ja: '特記事項なし' },
  'viewer.yes': { en: 'YES', ja: 'あり' },
  'viewer.no': { en: 'NO', ja: 'なし' },
  'viewer.male': { en: 'Male', ja: '男性' },
  'viewer.female': { en: 'Female', ja: '女性' },
  'viewer.other': { en: 'Other', ja: 'その他' },
  'viewer.cancel': { en: 'Cancel', ja: 'キャンセル' },
  'viewer.confirm_reject': { en: 'Confirm Rejection', ja: '差戻しを確定' },
  'viewer.positive': { en: 'Positive', ja: '陽性' },
  'viewer.negative': { en: 'Negative', ja: '陰性' },
  'viewer.diabetes': { en: 'Diabetes', ja: '糖尿病' },
  'viewer.hypertension': { en: 'Hypertension', ja: '高血圧' },
  'viewer.bp': { en: 'Blood Pressure', ja: '血圧' },
  'viewer.findings_right_placeholder': { en: 'Enter clinical observations for the right eye...', ja: '右眼の臨床所見を入力してください...' },
  'viewer.findings_left_placeholder': { en: 'Enter clinical observations for the left eye...', ja: '左眼の臨床所見を入力してください...' },
  
  'report.tab.right': { en: 'Right Eye OD', ja: '右眼 OD' },
  'report.tab.left': { en: 'Left Eye OS', ja: '左眼 OS' },
  'report.checklist.title': { en: 'Findings Checklist', ja: '所見チェックリスト' },
  'report.checklist.drusen': { en: 'Drusen', ja: 'ドルーゼン' },
  'report.checklist.hemorrhage': { en: 'Hemorrhage', ja: '出血' },
  'report.checklist.hard_exudate': { en: 'Hard Exudate', ja: '硬性白斑' },
  'report.checklist.soft_exudate': { en: 'Soft Exudate', ja: '軟性白斑' },
  'report.checklist.neovascularization': { en: 'Neovascularization', ja: '新生血管' },
  'report.checklist.microaneurysm': { en: 'Microaneurysm', ja: '毛細血管瘤' },
  'report.checklist.macular_edema': { en: 'Macular Edema', ja: '黄斑浮腫' },
  'report.checklist.pigment_abnormality': { en: 'Pigment Abnormality', ja: '色素異常' },
  'report.checklist.optic_disc_abnormality': { en: 'Optic Disc Abnormality', ja: '視神経乳頭異常' },
  'report.checklist.vascular_abnormality': { en: 'Vascular Abnormality', ja: '血管異常' },
  'report.checklist.vitreous_opacity': { en: 'Vitreous Opacity', ja: '硝子体混濁' },
  'report.checklist.retinal_detachment': { en: 'Retinal Detachment', ja: '網膜剥離' },
  
  'report.severity.title': { en: 'Severity', ja: '重症度' },
  'report.severity.none': { en: 'None', ja: 'なし' },
  'report.severity.mild': { en: 'Mild', ja: '軽度' },
  'report.severity.moderate': { en: 'Moderate', ja: '中等度' },
  'report.severity.severe': { en: 'Severe', ja: '重度' },
  
  'report.judgment.title': { en: 'Judgment', ja: '判定' },
  'report.judgment.a': { en: 'A: Normal', ja: 'A: 正常' },
  'report.judgment.b': { en: 'B: Observation', ja: 'B: 要経過観察' },
  'report.judgment.c1': { en: 'C1: Detailed Exam', ja: 'C1: 要精密検査' },
  'report.judgment.c2': { en: 'C2: Treatment', ja: 'C2: 要治療' },
  'report.judgment.d': { en: 'D: Emergency', ja: 'D: 緊急' },
  
  'report.recommend_referral': { en: 'Referral Recommended', ja: '専門医紹介推奨' },
  'report.recommend_retest': { en: 'Re-test Recommended', ja: '再検査推奨' },
  'report.save_draft': { en: 'Save Draft', ja: '一時保存' },
  'report.submit': { en: 'Submit Report', ja: '診断レポートを提出' },

  'viewer.clinical_info': { en: 'Clinical Information', ja: '臨床情報' },
  'viewer.patient_history': { en: 'Patient History', ja: '既往歴' },
  'viewer.attending_physician': { en: 'Attending Physician', ja: '主治医' },
  'viewer.hospital': { en: 'Hospital', ja: '所属病院' },
  'viewer.chat_title': { en: 'Collaboration Chat', ja: 'コラボレーションチャット' },
  'viewer.conference_mode': { en: 'Conference Mode', ja: 'カンファレンスモード' },
  'viewer.start_video': { en: 'Start Video Call', ja: 'ビデオ通話を開始' },
  'viewer.chat_placeholder': { en: 'Type a message...', ja: 'メッセージを入力...' },
  'viewer.chat.mock1': { en: 'Patient mentioned slight blurriness in the right eye.', ja: '受診者は右眼のわずかなかすみを訴えています。' },
  'viewer.chat.mock2': { en: 'Understood. I will check the macula area carefully.', ja: '了解しました。黄斑部を重点的に確認します。' },

  'viewer.oct_slice': { en: 'OCT Slice', ja: 'OCT スライス' },
  'viewer.layer_extraction': { en: 'Layer Extraction', ja: '自動層抽出' },
  'viewer.thickness_map': { en: 'Thickness Map', ja: '厚さマップ' },
  'viewer.multi_modal': { en: 'Multi-modal View', ja: 'マルチモーダル表示' },
  'viewer.measure.dist': { en: 'Distance', ja: '距離測定' },
  'viewer.measure.area': { en: 'Area', ja: '面積測定' },
  'viewer.ai_analysis': { en: 'AI Analysis', ja: 'AI 解析' },
  'viewer.risk_score': { en: 'Risk Score', ja: 'リスクスコア' },
  'viewer.icd10': { en: 'ICD-10 Code', ja: 'ICD-10 コード' },
  'viewer.export_pdf': { en: 'Export PDF', ja: 'PDF 出力' },
  'viewer.export_fhir': { en: 'Export FHIR', ja: 'FHIR 出力' },
  'viewer.digital_signature': { en: 'Digital Signature', ja: '電子署名' },
  
  'register.device_type': { en: 'Device Type', ja: '機器種別' },
  'register.device.fundus': { en: 'Fundus Camera', ja: '眼底カメラ' },
  'register.device.oct': { en: 'OCT', ja: '光干渉断層計 (OCT)' },
  'register.manufacturer': { en: 'Manufacturer', ja: '製造業者' },
  'register.model': { en: 'Model Name', ja: '機器名称・型式' },
  'register.batch_upload': { en: 'Batch Upload', ja: '一括アップロード' },

  'settings.devices': { en: 'Device Management', ja: '機器管理' },
  'settings.audit_logs': { en: 'Audit Logs', ja: '監査ログ' },
  
  'queue.title': { en: 'Reading Queue', ja: '読影キュー' },
  'queue.subtitle': { en: 'Your assigned cases pending diagnosis', ja: '診断待ちの担当症例' },
  
  'billing.total_revenue': { en: 'Gross Revenue', ja: '総売上' },
  'billing.total_payout': { en: 'Physician Payouts', ja: '医師支払額' },
  'billing.gross_margin': { en: 'Gross Margin', ja: '売上総利益' },
  'billing.client_billing': { en: 'Client Billing Breakdown', ja: '依頼元請求内訳' },
  'billing.physician_payouts': { en: 'Physician Payout Details', ja: '医師支払内訳' },
  'billing.calculate': { en: 'Calculate', ja: '試算' },
  'billing.confirm': { en: 'Confirm', ja: '確定' },
  'billing.export': { en: 'Export Invoice', ja: '請求書出力' },
  
  'action.back': { en: 'Back', ja: '戻る' },
  'action.save_draft': { en: 'Save Draft', ja: '下書き保存' },
  'action.submit': { en: 'Submit Report', ja: 'レポート提出' },
  'action.approve': { en: 'Approve', ja: '承認' },
  'action.reject': { en: 'Reject', ja: '差戻し' },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ja');

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    console.warn(`Translation key not found: ${key}`);
    return key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
