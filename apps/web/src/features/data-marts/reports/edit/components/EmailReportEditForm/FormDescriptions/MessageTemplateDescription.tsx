import { TemplateSourceTypeEnum } from '../../../../shared';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';

export interface MessageTemplateDescriptionProps {
  type: TemplateSourceTypeEnum;
}

export default function MessageTemplateDescription({ type }: MessageTemplateDescriptionProps) {
  if (type === TemplateSourceTypeEnum.INSIGHT_TEMPLATE) {
    return (
      <Accordion variant='common' type='single' collapsible>
        <AccordionItem value='insight-template-details' className='border-none'>
          <AccordionTrigger>Phân tích chuyên sâu hoạt động thế nào?</AccordionTrigger>
          <AccordionContent className='text-muted-foreground'>
            <p>
              Phân tích chuyên sâu cho phép bạn dùng bố cục và biểu đồ dữ liệu dựng sẵn. Chọn một
              phân tích chuyên sâu từ danh sách để dùng trong báo cáo.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <Accordion variant='common' type='single' collapsible className='space-y-1'>
      <AccordionItem value='message-details' className='border-none'>
        <AccordionTrigger>Làm cách nào để định dạng nội dung?</AccordionTrigger>
        <AccordionContent className='text-muted-foreground'>
          <p className='mb-2'>
            Bạn có thể định dạng nội dung bằng Markdown — một cú pháp văn bản đơn giản cho phép
            thêm cấu trúc và kiểu chữ mà không cần trình soạn thảo phức tạp.
          </p>
          <p className='mb-2'>
            Ví dụ:
            <br />
            **văn bản đậm** → <b>văn bản đậm</b>
            <br />
            *văn bản nghiêng* → <i>văn bản nghiêng</i>
            <br />- mục danh sách → • mục danh sách
          </p>
          <p>
            Dùng tab Xem trước để xem nội dung sẽ hiển thị như thế nào sau khi định dạng.
            <br />
            Nếu bạn mới dùng Markdown, xem thêm trong{' '}
            <ExternalAnchor
              className='underline'
              href='https://www.markdownguide.org/basic-syntax/'
            >
              hướng dẫn nhanh
            </ExternalAnchor>
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='data-table-details' className='border-none'>
        <AccordionTrigger>Làm cách nào để thêm dữ liệu vào nội dung?</AccordionTrigger>
        <AccordionContent className='text-muted-foreground'>
          <p className='mb-2'>
            Dùng thẻ <code>{'{{table}}'}</code> để hiển thị kết quả Data Mart dưới dạng bảng. Gõ{' '}
            <code>/</code> trong trình soạn thảo để chèn nhanh hoặc dán thủ công.
          </p>
          <p className='mb-2'>
            Tham số tùy chọn:
            <br />
            <code>limit</code> — số dòng tối đa cần hiển thị. Cho phép từ 1 đến 100. Mặc định:{' '}
            <code>100</code> (cũng là giới hạn tối đa). Ví dụ: <code>limit=20</code>
            <br />
            <code>columns</code> — danh sách cột ngăn cách bằng dấu phẩy. Ví dụ:{' '}
            <code>{'columns="id, revenue"'}</code>
          </p>
          <p className='mb-2'>
            Ví dụ:
            <br />
            <code>{'{{table limit=20 columns="id, revenue"}}'}</code>
          </p>
          <p className='mb-2'>
            Bạn cũng có thể dùng biến <code>{'{{dataHeadersCount}}'}</code> để hiển thị tổng số
            cột.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
