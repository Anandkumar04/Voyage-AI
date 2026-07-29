import { useEffect } from 'react';

export function useSEO(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} | Voyage AI`;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description]);
}
