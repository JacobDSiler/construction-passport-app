import React from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';
import { useI18n } from '../lib/i18n';

/** Drop-in replacement for React Native's Text. With a second language on, the English stays and its translation appears beneath. */
export function Text({ children, style, ...rest }: TextProps) {
  const { tr } = useI18n();
  let plain: string | null = null;
  if (typeof children === 'string') plain = children;
  else if (Array.isArray(children) && children.every((c) => typeof c === 'string' || typeof c === 'number')) plain = children.join('');
  const second = plain ? tr(plain) : null;
  if (!second) return <RNText style={style} {...rest}>{children}</RNText>;
  const flat = StyleSheet.flatten(style) ?? {};
  const base = typeof flat.fontSize === 'number' ? flat.fontSize : 14;
  return (
    <RNText style={style} {...rest}>
      {children}
      {'\n'}
      <RNText style={{ fontSize: Math.max(11, Math.round(base * 0.8)), fontWeight: '500', fontStyle: 'italic' }}>{second}</RNText>
    </RNText>
  );
}
