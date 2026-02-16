import * as React from 'react';

interface EmailTemplateProps {
    firstName: string;
    message?: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    firstName,
    message,
}) => (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
        <h1>Welcome, {firstName}!</h1>
        <p>Thanks for trying out ListingContentAI.</p>
        {message && <p>{message}</p>}
        <hr />
        <p style={{ fontSize: '12px', color: '#666' }}>
            ListingContentAI Team
        </p>
    </div>
);
