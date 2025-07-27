import React, { useLayoutEffect } from 'react';
import { createCustomContext } from 'create-custom-context';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism-tomorrow.css';

interface PrismContextType {
  highlight: () => void;
  highlightElement: (element: Element) => void;
  highlightText: (text: string, language: string) => string;
}

const [PrismProvider, usePrism] = createCustomContext<PrismContextType>(() => {
  const highlight = () => Prism.highlightAll();
  const highlightText = (text: string, language: string) => {
    return Prism.highlight(
      text,
      Prism.languages[language] || Prism.languages,
      language
    );
  };
  const highlightElement = (element: Element) =>
    Prism.highlightElement(element);

  return {
    highlight,
    highlightElement,
    highlightText,
  };
});

interface PrismWrapperProps {
  children: React.ReactNode;
  autoHighlight?: boolean;
}

export const PrismWrapper: React.FC<PrismWrapperProps> = ({
  children,
  autoHighlight = true,
}) => {
  const { highlight } = usePrism();

  useLayoutEffect(() => {
    if (autoHighlight) {
      const timer = setTimeout(highlight, 0);
      return () => clearTimeout(timer);
    }
  }, [autoHighlight, highlight]);

  return <>{children}</>;
};

export const PrismProviderWithWrapper: React.FC<PrismWrapperProps> = ({
  children,
  autoHighlight = true,
}) => {
  return (
    <PrismProvider>
      <PrismWrapper autoHighlight={autoHighlight}>{children}</PrismWrapper>
    </PrismProvider>
  );
};

export { PrismProviderWithWrapper as PrismProvider, usePrism };
