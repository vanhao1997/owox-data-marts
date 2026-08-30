import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';

export default function LookerStudioCacheLifetimeDescription() {
  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='cache-lifetime-details'>
        <AccordionTrigger>Thời gian lưu bộ nhớ đệm cho Data Studio là gì?</AccordionTrigger>
        <AccordionContent>
          <p className='mb-2'>
            Thời gian lưu bộ nhớ đệm xác định khoảng thời gian mà kết quả từ các lần truy vấn trước
            được phục vụ từ bộ nhớ đệm phía kho, giúp không cần chạy lại truy vấn.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
