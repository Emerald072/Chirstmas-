import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'24 Days of Happiness ♡',description:'給王志宇小公主的聖誕故事'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}
