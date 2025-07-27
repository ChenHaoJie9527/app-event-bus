import { useEffect, FC, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { usePrism } from '@/providers/PrismProvider';

interface CodeTypewriterProps {
  text: string;
  duration?: number;
  charDelay?: number;
  className?: string;
  language?: string;
  // 内容淡入参数
  contentFadeInDuration?: number;
}

export const CodeTypewriter: FC<CodeTypewriterProps> = ({
  text,
  duration = 3,
  className,
  language = 'typescript',
  contentFadeInDuration = 0.3,
}) => {
  const { highlightText } = usePrism();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayHTML, setDisplayHTML] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      const currentText = text.slice(0, latest);
      const highlighted = highlightText(currentText, language);
      setDisplayHTML(highlighted);
    });

    return unsubscribe;
  }, [rounded, text, language, highlightText]);

  useEffect(() => {
    setIsStarted(true);
    const controls = animate(count, text.length, {
      type: 'tween',
      duration,
      ease: 'easeInOut',
    });
    return controls.stop;
  }, [count, text.length, duration]);

  return (
    <div className={className}>
      {isStarted && (
        <motion.span
          animate={{ opacity: 1 }}
          dangerouslySetInnerHTML={{
            __html: displayHTML,
          }}
          initial={{ opacity: 0 }}
          transition={{ duration: contentFadeInDuration }}
        />
      )}
    </div>
  );
};
