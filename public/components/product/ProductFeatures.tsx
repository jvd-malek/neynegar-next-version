import React from 'react';
import { Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';

interface Feature {
  key: string;
  value: string;
}

interface ProductFeaturesProps {
  features: Feature[];
  size?: string;
  weight?: number;
  publisher?: string;
  publishDate?: string;
  brand?: string;
}

const ProductFeatures: React.FC<ProductFeaturesProps> = ({ 
  features, 
  size, 
  weight, 
  publisher, 
  publishDate, 
  brand 
}) => {
  // ترکیب features اصلی با اطلاعات تکمیلی
  const allFeatures = [...(features || [])];
  
  if (brand) allFeatures.push({ key: 'برند', value: brand });
  if (publisher) allFeatures.push({ key: 'ناشر', value: publisher });
  if (publishDate) allFeatures.push({ key: 'تاریخ انتشار', value: publishDate });
  if (size) allFeatures.push({ key: 'سایز', value: size });
  if (weight) allFeatures.push({ key: 'وزن', value: `${weight} گرم` });

  if (allFeatures.length === 0) {
    return (
      <div className="w-full py-8 text-center text-gray-400">
        <BoltIcon sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="body1">ویژگی‌ای برای این محصول ثبت نشده است</Typography>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Typography variant="h6" className="font-bold text-gray-800 mb-4">
        ویژگی‌های محصول
      </Typography>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <tbody>
            {allFeatures.map((feature, index) => (
              <tr 
                key={index}
                className={`
                  ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  hover:bg-blue-50 transition-colors
                `}
              >
                <td className="py-3 px-4 text-sm font-medium text-gray-700 border-l border-gray-200 w-1/3">
                  {feature.key}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {feature.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductFeatures;