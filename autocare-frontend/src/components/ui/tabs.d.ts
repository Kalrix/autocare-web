declare module '@/components/ui/tabs' {
  import * as React from 'react';

  export const Tabs: React.FC<React.ComponentProps<'div'>>;
  export const TabsList: React.FC<React.ComponentProps<'div'>>;
  export const TabsTrigger: React.FC<React.ComponentProps<'button'>>;
  export const TabsContent: React.FC<React.ComponentProps<'div'>>;
}
