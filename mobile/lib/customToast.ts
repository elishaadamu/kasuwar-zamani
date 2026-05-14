import { Alert } from 'react-native';

export const customToast = {
  success: (title: string, subtext?: string) => {
    const mainTitle = subtext ? title : "Success";
    const desc = subtext || title;
    Alert.alert(mainTitle, desc);
  },
  error: (title: string, subtext?: string) => {
    const mainTitle = subtext ? title : "Action Failed";
    const desc = subtext || title;
    Alert.alert(mainTitle, desc);
  },
  info: (title: string, subtext?: string) => {
    const mainTitle = subtext ? title : "Information";
    const desc = subtext || title;
    Alert.alert(mainTitle, desc);
  },
  warn: (title: string, subtext?: string) => {
    const mainTitle = subtext ? title : "Warning";
    const desc = subtext || title;
    Alert.alert(mainTitle, desc);
  },
};
