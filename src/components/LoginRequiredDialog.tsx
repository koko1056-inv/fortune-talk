import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface LoginRequiredDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLogin: () => void;
    onCancel: () => void;
}

const LoginRequiredDialog = ({
    open,
    onOpenChange,
    onLogin,
    onCancel,
}: LoginRequiredDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LogIn className="w-5 h-5 text-primary" />
                        ログインが必要です
                    </DialogTitle>
                    <DialogDescription>
                        占いを開始するにはログインが必要です。
                        アカウントをお持ちでない方も簡単に登録できます。
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Button className="w-full" onClick={onLogin}>
                        <LogIn className="w-4 h-4 mr-2" />
                        ログイン / 新規登録
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onCancel}>
                        キャンセル
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LoginRequiredDialog;
