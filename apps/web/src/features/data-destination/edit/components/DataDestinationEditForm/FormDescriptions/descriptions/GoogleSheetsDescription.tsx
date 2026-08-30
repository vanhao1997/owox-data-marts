import { AccordionItem, AccordionTrigger, AccordionContent } from '@owox/ui/components/accordion';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';

export default function GoogleSheetsDescription() {
  return (
    <AccordionItem value='sheets-api-details'>
      <AccordionTrigger>Làm sao bật Google Sheets API?</AccordionTrigger>
      <AccordionContent>
        <p className='mb-2'>
          Để gửi dữ liệu sang Google Sheets, bạn cần bật{' '}
          <ExternalAnchor href='https://console.cloud.google.com/apis/library/sheets.googleapis.com'>
            Google Sheets API
          </ExternalAnchor>{' '}
          trong dự án Google Cloud của bạn.
        </p>
        <p className='mb-2'>Cách thực hiện:</p>
        <ol className='list-inside list-decimal space-y-2 text-sm'>
          <li>Mở liên kết ở trên và bảo đảm dự án đúng đã được chọn.</li>
          <li>
            Nếu API chưa bật, hãy bấm <strong>Bật</strong>.
          </li>
          <li>Nếu API đã bật rồi, bạn sẽ thấy bảng điều khiển API — như vậy là ổn.</li>
        </ol>
      </AccordionContent>
    </AccordionItem>
  );
}
