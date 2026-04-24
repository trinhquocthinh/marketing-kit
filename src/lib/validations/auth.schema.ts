import { z } from 'zod';

const PHONE_NUMBER_REGEX = /([84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(PHONE_NUMBER_REGEX, 'Số điện thoại không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  isConfirmTerms: z.literal(true, {
    message: 'Vui lòng đồng ý với điều khoản',
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
