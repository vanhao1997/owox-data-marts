import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';

/**
 * Accordion with information about the Data Studio JSON Config.
 */
export default function LookerStudioJsonConfigDescription() {
  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='json-config-details'>
        <AccordionTrigger>JSON Config cho Data Studio là gì?</AccordionTrigger>
        <AccordionContent>
          <p className='mb-2'>
            JSON Config chứa thông tin xác thực và cấu hình cần thiết để kết nối với Data Studio.
          </p>
          <ul className='list-inside space-y-2 text-sm'>
            <li>Bạn cần sao chép JSON config này để dùng trong Data Studio Connector.</li>
            <li>
              Nếu cần đổi khóa bí mật cũ, bạn có thể dùng chức năng tương ứng trong menu ở danh
              sách điểm đến.
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
