// mui components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface FAQ {
    question: string;
    answer: string;
}

interface FAQProps {
    faqs: FAQ[];
}

const FAQ: React.FC<FAQProps> = ({ faqs }) => {
    if (!faqs || faqs.length === 0) {
        return (
            <div className="w-full py-8 text-center text-gray-400 lg:block hidden">
                <HelpOutlineIcon sx={{ fontSize: 48, mb: 1 }} />
                <p>هنوز سوالی برای این محصول ثبت نشده است</p>
            </div>
        );
    }

    return (
        <div id='faq' className="w-full space-y-2 bg-white rounded-xl p-6 h-fit">
            <h5 className="text-lg font-bold mb-4">
                سوالات متداول
            </h5>

            {faqs.map((faq, index) => (
                <Accordion
                    key={index}
                    className="shadow-none border border-gray-200 rounded-lg before:hidden"
                    sx={{
                        '&:before': { display: 'none' },
                        '&.Mui-expanded': { margin: 0 }
                    }}
                    defaultExpanded={index == 0}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg"
                        sx={{
                            '&.Mui-expanded': {
                                minHeight: 48,
                                borderBottom: '1px solid #e5e7eb'
                            }
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs rounded-full shrink-0">
                                {index + 1}
                            </span>
                            <p className="text-gray-800 font-medium text-sm">
                                {faq.question}
                            </p>
                        </div>
                    </AccordionSummary>

                    <AccordionDetails className="bg-white p-4">
                        <p className="text-gray-600 text-sm leading-7">
                            {faq.answer}
                        </p>
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

export default FAQ;