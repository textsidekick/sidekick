const translations: Record<string, Record<string, string>> = {
  en: {
    // Sidebar nav
    "Overview": "Overview",
    "Inbox": "Inbox",
    "Training": "Training",
    "Knowledge": "Knowledge",
    "Work Orders": "Work Orders",
    "Assets": "Assets",
    "Team": "Team",
    "Updates": "Updates",
    "Settings": "Settings",
    "Home": "Home",
    "Logout": "Logout",
    // Common buttons
    "Save": "Save",
    "Cancel": "Cancel",
    "Assign": "Assign",
    "Search": "Search",
    "Assign All": "Assign All",
    "Create Path": "Create Path",
    // Training page
    "Training Paths": "Training Paths",
    "New Training Path": "New Training Path",
    "No training paths yet": "No training paths yet",
    "Enrolled Workers": "Enrolled Workers",
    "Learning Steps": "Learning Steps",
    "Training Materials": "Training Materials",
    "Assign to a Worker": "Assign to a Worker",
    "Assign to Entire Department": "Assign to Entire Department",
    "Reminder": "Reminder",
    "No reminders": "No reminders",
    "Daily": "Daily",
    "Weekly": "Weekly",
    "Reminder time": "Reminder time",
    "Due date": "Due date",
    "Overdue": "Overdue",
    // Other pages
    "Workers Enrolled": "Workers Enrolled",
    "In Progress": "In Progress",
    "Completed": "Completed",
    "Completion Rate": "Completion Rate",
  },
  ko: {
    // Sidebar nav
    "Overview": "개요",
    "Inbox": "수신함",
    "Training": "교육",
    "Knowledge": "지식",
    "Work Orders": "작업 지시",
    "Assets": "자산",
    "Team": "팀",
    "Updates": "업데이트",
    "Settings": "설정",
    "Home": "홈",
    "Logout": "로그아웃",
    // Common buttons
    "Save": "저장",
    "Cancel": "취소",
    "Assign": "배정",
    "Search": "검색",
    "Assign All": "전체 배정",
    "Create Path": "경로 생성",
    // Training page
    "Training Paths": "교육 경로",
    "New Training Path": "새 교육 경로",
    "No training paths yet": "교육 경로가 없습니다",
    "Enrolled Workers": "등록된 직원",
    "Learning Steps": "학습 단계",
    "Training Materials": "교육 자료",
    "Assign to a Worker": "직원에게 배정",
    "Assign to Entire Department": "부서 전체 배정",
    "Reminder": "알림",
    "No reminders": "알림 없음",
    "Daily": "매일",
    "Weekly": "매주",
    "Reminder time": "알림 시간",
    "Due date": "마감일",
    "Overdue": "기한 초과",
    // Other pages
    "Workers Enrolled": "등록된 직원",
    "In Progress": "진행 중",
    "Completed": "완료",
    "Completion Rate": "완료율",
  },
};

export function getLanguage(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("sidekick_ui_language") || "en";
}

export function t(key: string): string {
  if (typeof window === "undefined") return key;
  const lang = getLanguage();
  return translations[lang]?.[key] ?? translations["en"]?.[key] ?? key;
}

export function useLanguage(): string {
  if (typeof window === "undefined") return "en";
  return getLanguage();
}
