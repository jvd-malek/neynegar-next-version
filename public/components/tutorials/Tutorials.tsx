// next
import Link from "next/link";

// icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';

// mui components
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// components
import Box from "@/public/components/product-boxes/Box";

// types
import { productCoverType } from "@/public/types/product";

interface tutorial {
    title: string;
    articleDesc: string;
    articleLink: string;
    courseDesc: string;
    courseLink: string;
    products?: productCoverType[];
    productsLink: string;
}

function Tutorials(tutorial: tutorial) {

    const list = [
        {
            id: 1,
            title: `آموزش ${tutorial.title}`,
            desc: tutorial.courseDesc,
            link: `course/${tutorial.courseLink}`
        },
        {
            id: 2,
            title: `در باب ${tutorial.title}`,
            desc: tutorial.articleDesc,
            link: `article/${tutorial.articleLink}`
        },
        {
            id: 3,
            title: `محصولات ${tutorial.title}`,
            link: `category/دوره/${tutorial.productsLink}`
        }
    ]

    return (
        <div className="mt-8 mb-18">
            {list.map(l => (
                <Accordion defaultExpanded={l.id == 1} key={l.id}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        className="font-semibold text-lg"
                    >
                        {l.title}
                    </AccordionSummary>
                    <AccordionDetails>
                        {l.id == 3 ?
                            <Box products={tutorial.products} />
                            :
                            <p className="line-clamp-2 text-justify">
                                {l.desc}
                            </p>
                        }
                    </AccordionDetails>
                    <AccordionActions
                    className="border-t border-mist-300"
                    >
                        <Link
                            href={l.link}
                            className="flex items-center gap-x-1.5 cursor-pointer text-sm"
                        >
                            {l.id == 1 && "ورود به دوره"}
                            {l.id == 2 && "مشاهده مقاله"}
                            {l.id == 3 && "مشاهده همه"}
                            <div className="text-slate-600">
                                <KeyboardBackspaceRoundedIcon fontSize="small" />
                            </div>
                        </Link>
                    </AccordionActions>
                </Accordion>
            ))}
        </div>
    );
}

export default Tutorials;