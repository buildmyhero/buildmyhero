import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSendCharacterEmail() {
  const [isSending, setIsSending] = useState(false);

  const sendEmail = async (characterId: string, email: string): Promise<boolean> => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-character-email', {
        body: { characterId, email },
      });

      if (error) {
        console.error('Email send error:', error);
        toast.error(error.message || 'Failed to send email');
        return false;
      }

      if (data?.error) {
        toast.error(data.error);
        return false;
      }

      if (data?.success) {
        toast.success('Character emailed successfully!');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Failed to send email');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    sendEmail,
  };
}
