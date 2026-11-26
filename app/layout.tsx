import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'24 Days of Happiness ♡',description:'聖誕快樂小胖子'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}
