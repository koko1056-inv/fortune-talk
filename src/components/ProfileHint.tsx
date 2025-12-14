import { memo } from "react";

const ProfileHint = memo(() => {
  return (
    <p className="text-[10px] md:text-xs text-muted-foreground/60 text-center px-4">
      💡 ログインしてプロフィールを登録すると、
      <br className="md:hidden" />
      パーソナライズされた占いを受けられます
    </p>
  );
});

ProfileHint.displayName = "ProfileHint";

export default ProfileHint;
