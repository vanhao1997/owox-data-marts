import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, X, ChevronRight } from 'lucide-react';
import { Button } from '@owox/ui/components/button';

const DOCS_PAGES = [
    { id: 'index', title: 'Bắt đầu nhanh (Getting Started)' },
    { id: 'configuration', title: 'Cấu hình OWOX (Configuration)' },
    { id: 'facebook-marketing', title: 'Kết nối Facebook Ads' },
    { id: 'bigquery', title: 'Kết nối kho dữ liệu BigQuery' },
];

export function DocsWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('index');
    const [content, setContent] = useState('Đang tải nội dung...');

    useEffect(() => {
        if (isOpen) {
            setContent('Đang tải nội dung...');
            fetch(`/docs_vi/${currentPage}.md`)
                .then(res => {
                    if (!res.ok) throw new Error('File không tồn tại');
                    return res.text();
                })
                .then(text => setContent(text))
                .catch(() => setContent('Nội dung tài liệu này chưa được cập nhật hoặc không tìm thấy.'));
        }
    }, [isOpen, currentPage]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-colors flex items-center justify-center group"
            >
                <BookOpen className="w-6 h-6 mr-0 group-hover:mr-2 transition-all" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-medium text-sm">
                    Hướng Dẫn (Docs)
                </span>
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b bg-slate-50">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold">Tài Liệu Hướng Dẫn</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Docs Navigation */}
                    <div className="w-1/3 border-r bg-slate-50 overflow-y-auto p-4 flex flex-col gap-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Danh mục</h3>
                        {DOCS_PAGES.map(page => (
                            <button
                                key={page.id}
                                onClick={() => setCurrentPage(page.id)}
                                className={`text-left text-sm p-2 rounded-md transition-colors ${currentPage === page.id ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-slate-200 text-slate-600'
                                    }`}
                            >
                                {page.title}
                            </button>
                        ))}

                        <div className="mt-8 pt-4 border-t border-slate-200">
                            <a href="https://docs.owox.com" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
                                Tài liệu gốc tiếng Anh <ChevronRight className="w-3 h-3 ml-1" />
                            </a>
                        </div>
                    </div>

                    {/* Docs Content */}
                    <div className="w-2/3 p-6 overflow-y-auto prose prose-sm prose-blue max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </>
    );
}
