import { Building2 } from "lucide-react";
import { useState } from "react";
import { personPhotoUrl } from "../../utils/avatars";
import { firmLogoUrl, type Firm } from "../data";

export function FirmLogo({ firm, size = 32 }: { firm: Firm; size?: number }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };
  if (failed) {
    return (
      <span style={style} className="flex shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
        {firm.name.charAt(0)}
      </span>
    );
  }
  return <img src={firmLogoUrl(firm.domain)} alt="" style={style} onError={() => setFailed(true)} className="shrink-0 rounded-lg border border-gray-100 bg-white object-contain p-0.5 dark:border-neutral-700" />;
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };
  if (failed) {
    return (
      <span style={style} className="flex shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
        {name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)}
      </span>
    );
  }
  return <img src={personPhotoUrl(name)} alt="" style={style} onError={() => setFailed(true)} className="shrink-0 rounded-full object-cover" />;
}

export function CompanyTile({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 dark:from-neutral-800 dark:to-neutral-700 dark:text-neutral-300">
      {name ? <span className="text-sm font-semibold">{name.charAt(0)}</span> : <Building2 className="h-4 w-4" />}
    </span>
  );
}
