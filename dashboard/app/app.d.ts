declare namespace JSX {
    interface IntrinsicElements {
        'logo': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'side': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'leading': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'group': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'xx-element2': React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement>; // Web component extended from input
    }
}