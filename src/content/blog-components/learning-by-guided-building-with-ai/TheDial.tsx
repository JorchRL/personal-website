"use client";

// Fig. 3, live: one setting at a time, chosen on the dial's list.

import { useId, useState } from "react";
import type { SettingId } from "./data";
import { DialView } from "./views";

export default function TheDial() {
  const [setting, setSetting] = useState<SettingId>("hand");
  return <DialView setting={setting} onSetting={setSetting} name={useId()} />;
}
