import { Card, CardHeader, CardTitle, CardContent } from '@owox/ui/components/card';
import { Button } from '../../shared';

export default function FacebookMarketingDocs() {
    return (
        <div className='p-6 max-w-4xl mx-auto space-y-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-bold'>Hướng Dẫn Kết Nối Facebook Marketing</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>1. Yêu cầu chuẩn bị</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 text-sm'>
                    <p>Trước khi kết nối Facebook Marketing (Ads) với P2P Digital Data Marts, bạn cần chuẩn bị:</p>
                    <ul className='list-disc pl-6 space-y-2'>
                        <li>Tài khoản Facebook Developer (Meta for Developers).</li>
                        <li>Tài khoản Facebook Ads (Ads Manager) chứa chiến dịch bạn muốn trích xuất dữ liệu.</li>
                        <li>Đã thiết lập ít nhất 1 Storage Container (BigQuery hoặc PostgreSQL) trên P2P.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. Lấy Access Token (Long-Lived)</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 text-sm'>
                    <p>Connector của nền tảng hỗ trợ truy xuất tự động và dùng <strong>Long-Lived Access Token</strong> (60 ngày) để duy trì truy cập. Để lấy Token, thực hiện như sau:</p>
                    <ol className='list-decimal pl-6 space-y-2'>
                        <li>Truy cập <a href='https://developers.facebook.com/' target='_blank' rel='noreferrer' className='text-blue-600 hover:underline'>Meta for Developers</a>.</li>
                        <li>Tạo một App mới loại <strong>Doanh Nghiệp (Business)</strong>.</li>
                        <li>Cấu hình <strong>Marketing API</strong>. Sinh token bằng công cụ Graph API Explorer.</li>
                        <li>Cấp các quyền: <code>ads_read</code>, <code>read_insights</code>, <code>ads_management</code>.</li>
                        <li>Lấy <strong>App ID</strong>, <strong>App Secret</strong> và dán vào phần cấu hình của P2P Data Marts (chuyên mục Credentials).</li>
                    </ol>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>3. Kiểm soát quyền bảo mật (Security & Safety)</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 text-sm'>
                    <p>Hệ thống P2P Digital Data Marts là bản self-hosted cài đặt trên máy chủ cá nhân của bạn. Điều này đảm bảo:</p>
                    <ul className='list-disc pl-6 space-y-2'>
                        <li>Mọi credentials (App ID, Secret, Access Token) chỉ tồn tại trong cơ sở dữ liệu trên VPS của bạn.</li>
                        <li>Các tiến trình gọi API (Fetch Insights, Ads Data) sẽ đi trực tiếp từ máy chủ P2P đến <code>https://graph.facebook.com/</code> mà không thông qua bất kỳ trạm trung chuyển (proxy) nào khác.</li>
                        <li>Tuyệt đối an toàn trước rò rỉ dữ liệu hoặc thất thoát tài nguyên quảng cáo (Tài khoản, Page).</li>
                    </ul>
                </CardContent>
            </Card>

            <div className='flex gap-4'>
                <Button onClick={() => window.history.back()}>Quay lại</Button>
            </div>
        </div>
    );
}
