import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';

export default function SendingConditionDescription() {
  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='sending-condition-details'>
        <AccordionTrigger>Kết quả chạy Data Mart là gì?</AccordionTrigger>
        <AccordionContent>
          <p className='mb-2'>
            Kết quả chạy Data Mart là kết quả sau khi xử lý Data Mart của bạn — ví dụ như chạy một
            truy vấn SQL để lấy dữ liệu cho báo cáo.
          </p>
          <p>
            Trước khi gửi báo cáo, P2PDigital sẽ tự động chạy Data Mart và kiểm tra kết quả. Tùy
            theo cài đặt, báo cáo có thể được gửi luôn, chỉ khi kết quả không trống, hoặc chỉ khi
            kết quả trống.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
