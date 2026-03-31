import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { MapPinIcon } from "./OnboardingIcons";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const prefectures = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県","海外",
];

const OnboardingBirthLocation = ({ value, onChange, onNext, onBack }: Props) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <div
      className={`flex flex-col items-center text-center min-h-[50vh] justify-center transition-all duration-700 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <button onClick={onBack} className="absolute top-8 left-6 p-2 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <MapPinIcon className="w-14 h-14 mb-6" />

      <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
        生まれた場所は
        <br />
        どちらですか？
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        地域の星の位置を正確に読み取ります
      </p>

      <div className="w-full max-w-xs mb-6">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-card/60 backdrop-blur border border-accent/20 rounded-2xl text-center text-lg text-foreground py-4 px-6 outline-none focus:border-accent/60 transition-colors appearance-none [color-scheme:dark]"
        >
          <option value="" disabled>都道府県を選択</option>
          {prefectures.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            if (!value) onChange("不明");
            onNext();
          }}
          className="px-6 py-3 rounded-full border border-muted-foreground/20 text-muted-foreground text-sm hover:border-accent/40 transition-all"
        >
          スキップ
        </button>
        <button
          onClick={onNext}
          disabled={!value}
          className="px-10 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold tracking-wider shadow-[0_0_20px_hsl(45_80%_55%/0.3)] hover:shadow-[0_0_30px_hsl(45_80%_55%/0.5)] disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default OnboardingBirthLocation;
