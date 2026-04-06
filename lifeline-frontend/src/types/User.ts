export type Usermode = 'easy' | 'normal' | null;

export interface UserState{
    isLoggedIn: boolean;
    username :string;
    mode:Usermode;

    setMode: (mode: Usermode) => void; //mode이름으로 usermode 가져오기 쓰레기통에버림반환 xx
    login: (name: string, mode: Usermode) => void;
    logout: () => void;

    
}



