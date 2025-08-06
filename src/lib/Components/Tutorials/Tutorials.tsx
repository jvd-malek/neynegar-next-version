import Image from "next/image";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';

import Link from "next/link";

import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { productCoverType } from "@/lib/Types/product";
import Box from "../ProductBoxes/Box";

interface tutorial {
    title: string;
    articleDesc: string;
    articleLink: string;
    courseDesc: string;
    courseLink: string;
    products?: productCoverType;
    productsLink: string;
}

function Tutorials(tutorial: tutorial) {

    const list = [
        {
            id: 1,
            title: `در باب ${tutorial.title}`,
            desc: tutorial.articleDesc,
            link: `article/${tutorial.articleLink}`
        },
        {
            id: 2,
            title: `آموزش ${tutorial.title}`,
            desc: tutorial.courseDesc,
            link: `course/${tutorial.courseLink}`
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
                    <div className="text-slate-800 text-shadow text-lg">
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            {l.title}
                        </AccordionSummary>
                    </div>
                    <AccordionDetails>
                        {l.id == 3 ?
                            <Box books={tutorial.products} tutorial/>
                            :
                            <p className="line-clamp-2 text-justify">
                                {l.desc}
                            </p>
                        }
                    </AccordionDetails>
                    <div className="border-t border-slate-300" >
                        <AccordionActions>
                            <Link
                                href={l.link}
                                className="flex items-center gap-x-1.5 cursor-pointer text-sm"
                            >
                                {l.id == 1 && "مشاهده مقاله"}
                                {l.id == 2 && "مشاهده دوره"}
                                {l.id == 3 && "مشاهده همه"}
                                <div className="text-slate-600">
                                    <KeyboardBackspaceRoundedIcon fontSize="small" />
                                </div>
                            </Link>
                        </AccordionActions>
                    </div>
                </Accordion>
            ))}
        </div>
    );
}

export default Tutorials;