import dbConnect from '@/lib/DB/db';
import linkModel from '@/lib/DB/model/linkModel';

export async function GET() {
    try {
        await dbConnect()
        const links = await linkModel.find({}).lean()
        return Response.json(
            links,
            { status: 200 }
        )
    } catch (error) {
        console.log(error);
        return;
    }
}

// const linkPostController = async (req, res) => {

//     const isBodyValid = validator(req.body)
//     if (isBodyValid != true) {
//         return res.status(422).json(isBodyValid)
//     }

//     const { txt, path, sort, subLinks } = req.body

//     const isLinkExists = await linkModel.findOne({
//         $or: [
//             { txt }, { path }
//         ]
//     }).lean()
//     if (isLinkExists) {
//         return res.status(409).json({ msg: "link has been registered" })
//     }

//     const link = await linkModel.create({
//         txt,
//         path,
//         sort,
//         subLinks
//     })

//     return res.status(201).json({ link })
// }

// const linkRemoveController = async (req, res) => {
//     if (isValidObjectId(req.params.id)) {
//         const links = await linkModel.findByIdAndDelete(req.params.id).lean()
//         if (links) {
//             return res.send(links)
//         } else {
//             return res.status(404).json({ msg: "links does not exist" })
//         }
//     } else {
//         return res.status(409).json({ msg: "links id is not valid" })
//     }
// }

// const linkUpdateController = async (req, res) => {

//     if (isValidObjectId(req.params.id)) {
//         const isBodyValid = validator(req.body)
//         if (isBodyValid != true) {
//             return res.status(422).json(isBodyValid)
//         }

//         const { txt, path, sort, subLinks } = req.body

//         const newLink = await linkModel.findByIdAndUpdate(req.params.id, {
//             txt,
//             path,
//             sort,
//             subLinks
//         }).lean()

//         if (newLink) {
//             return res.json({ newLink })
//         } else {
//             return res.status(404).json({ msg: "link does not exist" })
//         }
//     } else {
//         return res.status(409).json({ msg: "link id is not valid" })
//     }
// }