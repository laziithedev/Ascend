import React from 'react';
import * as Icons from 'lucide-react-native';

export default function LucideIconByName({ name, size = 16, color }) {
  const Icon = Icons[name];
  if (!Icon) return null;
  return <Icon size={size} color={color} />;
}
