interface Attribute {
    label: string
    value?: string | number
    pack?: { title: string, count: number }[]
}

export default function ProductAttributes({ attributes }: { attributes: Attribute[] }) {
    return (
        <table className="product-attributes shop_attributes hidden">
            <tbody>
                {attributes.map((attr, i) => (
                    <tr
                        key={i}
                        className="product-attributes-item product-attributes-item--attribute"
                    >
                        <th className="product-attributes-item__label">
                            <span className="wd-attr-name">{attr.label}</span>
                        </th>
                        <td className="product-attributes-item__value">
                            {attr.pack ?
                                attr.pack?.map(p=>(
                                    <p key={p.title}>{`${p.title} - ${p.count} عدد`}</p>
                                ))
                                :
                                <p>{attr.value}</p>
                            }
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
