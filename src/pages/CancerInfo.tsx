import React from 'react';
import { Heart, AlertCircle, Pill, IndianRupee, Stethoscope, Brain, Activity, Settings as Lungs, Clock, ArrowRight, FileText, Guitar as Hospital, UserCog, Microscope, Syringe } from 'lucide-react';

function CancerInfo() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <section className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="h-8 w-8 text-rose-600" />
          <h1 className="text-3xl font-bold text-gray-900">Understanding Cancer</h1>
        </div>
        <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
          <p>
            Cancer occurs when abnormal cells divide uncontrollably and can invade nearby tissues. These cells can also spread to other parts of the body through the blood and lymph systems.
          </p>
          <p>
            The fundamental characteristic of cancer is the rapid creation of abnormal cells that grow beyond their usual boundaries. These cells can form tumors (masses) and spread to other organs, a process known as metastasis.
          </p>
          <p>
            While cancer is a serious condition, many types are treatable, especially when detected early. Modern medicine has made significant advances in cancer treatment, offering multiple treatment options and improving survival rates.
          </p>
        </div>
      </section>

      <section className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cancer</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-100 rounded-lg">
            <Brain className="h-6 w-6 text-rose-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Brain Cancer</h3>
            <div className="space-y-2">
              <p className="text-gray-600">Primary brain tumors begin in brain tissue. Common types include:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Gliomas (including astrocytomas)</li>
                <li>Meningiomas</li>
                <li>Acoustic neuromas</li>
              </ul>
              <p className="text-gray-600">Early symptoms may include:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Persistent headaches</li>
                <li>Seizures</li>
                <li>Vision or speech problems</li>
                <li>Personality changes</li>
              </ul>
            </div>
          </div>
          
          <div className="p-6 border border-gray-100 rounded-lg">
            <Activity className="h-6 w-6 text-rose-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Breast Cancer</h3>
            <div className="space-y-2">
              <p className="text-gray-600">Most common cancer in women. Types include:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Ductal carcinoma in situ (DCIS)</li>
                <li>Invasive ductal carcinoma</li>
                <li>Invasive lobular carcinoma</li>
              </ul>
              <p className="text-gray-600">Early detection signs:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Lumps in breast or armpit</li>
                <li>Changes in breast size or shape</li>
                <li>Nipple changes or discharge</li>
                <li>Skin changes on breast</li>
              </ul>
            </div>
          </div>

          <div className="p-6 border border-gray-100 rounded-lg">
            <Lungs className="h-6 w-6 text-rose-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Lung Cancer</h3>
            <div className="space-y-2">
              <p className="text-gray-600">Two main types:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Non-small cell lung cancer (NSCLC)</li>
                <li>Small cell lung cancer (SCLC)</li>
              </ul>
              <p className="text-gray-600">Common symptoms:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Persistent cough</li>
                <li>Chest pain</li>
                <li>Shortness of breath</li>
                <li>Unexplained weight loss</li>
              </ul>
            </div>
          </div>

          <div className="p-6 border border-gray-100 rounded-lg">
            <AlertCircle className="h-6 w-6 text-rose-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Colorectal Cancer</h3>
            <div className="space-y-2">
              <p className="text-gray-600">Develops in colon or rectum. Types include:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Adenocarcinomas</li>
                <li>Carcinoid tumors</li>
                <li>Gastrointestinal stromal tumors</li>
              </ul>
              <p className="text-gray-600">Warning signs:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Changes in bowel habits</li>
                <li>Rectal bleeding</li>
                <li>Abdominal pain</li>
                <li>Unexplained weight loss</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Treatment Journey</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4 border-b pb-6">
            <div className="bg-rose-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">1. Diagnosis</h3>
              <p className="text-gray-600 mb-2">Initial tests and procedures may include:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Physical examination: ₹500 - ₹2,000</li>
                <li>Blood tests: ₹1,500 - ₹5,000</li>
                <li>Imaging (CT/MRI): ₹8,000 - ₹25,000</li>
                <li>Biopsy: ₹15,000 - ₹30,000</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start space-x-4 border-b pb-6">
            <div className="bg-rose-100 p-3 rounded-full">
              <UserCog className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">2. Treatment Planning</h3>
              <p className="text-gray-600 mb-2">Consultation and planning phase:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Oncologist consultation: ₹1,000 - ₹3,000 per visit</li>
                <li>Treatment planning: ₹5,000 - ₹15,000</li>
                <li>Genetic testing (if needed): ₹25,000 - ₹45,000</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start space-x-4 border-b pb-6">
            <div className="bg-rose-100 p-3 rounded-full">
              <Hospital className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">3. Primary Treatment</h3>
              <p className="text-gray-600 mb-2">Main treatment options and costs:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Surgery: ₹2,00,000 - ₹10,00,000</li>
                <li>Chemotherapy: ₹5,00,000 - ₹15,00,000 (full course)</li>
                <li>Radiation therapy: ₹3,00,000 - ₹8,00,000</li>
                <li>Targeted therapy: ₹50,000 - ₹2,00,000 per month</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start space-x-4 border-b pb-6">
            <div className="bg-rose-100 p-3 rounded-full">
              <Microscope className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">4. Monitoring & Follow-up</h3>
              <p className="text-gray-600 mb-2">Regular monitoring costs:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Follow-up visits: ₹1,000 - ₹3,000 per visit</li>
                <li>Blood tests: ₹2,000 - ₹5,000</li>
                <li>Imaging: ₹8,000 - ₹25,000</li>
                <li>Tumor marker tests: ₹3,000 - ₹8,000</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-rose-100 p-3 rounded-full">
              <Syringe className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">5. Supportive Care</h3>
              <p className="text-gray-600 mb-2">Additional support services:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Pain management: ₹2,000 - ₹5,000 per month</li>
                <li>Nutritional support: ₹1,500 - ₹3,000 per consultation</li>
                <li>Psychological counseling: ₹1,000 - ₹2,500 per session</li>
                <li>Physical therapy: ₹800 - ₹1,500 per session</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Treatment Mistakes to Avoid</h2>
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 rounded-lg">
            <h3 className="text-lg font-semibold text-rose-700">Delaying Treatment</h3>
            <p className="text-gray-700">Impact: Can lead to cancer progression and reduced treatment effectiveness. Early intervention typically results in better outcomes.</p>
          </div>
          
          <div className="p-4 bg-rose-50 rounded-lg">
            <h3 className="text-lg font-semibold text-rose-700">Choosing Alternative Medicine Only</h3>
            <p className="text-gray-700">While complementary therapies can help manage symptoms, they should not replace proven medical treatments. Always discuss alternative treatments with your oncologist.</p>
          </div>
          
          <div className="p-4 bg-rose-50 rounded-lg">
            <h3 className="text-lg font-semibold text-rose-700">Skipping Follow-up Care</h3>
            <p className="text-gray-700">Regular monitoring is crucial for detecting recurrence early and managing side effects effectively.</p>
          </div>
          
          <div className="p-4 bg-rose-50 rounded-lg">
            <h3 className="text-lg font-semibold text-rose-700">Not Discussing Financial Concerns</h3>
            <p className="text-gray-700">Many hospitals and organizations offer financial assistance programs. Don't let cost concerns prevent you from seeking treatment.</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Support Options</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <IndianRupee className="h-6 w-6 text-rose-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold">Government Schemes</h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Ayushman Bharat: Covers up to ₹5,00,000 per family per year</li>
                <li>Prime Minister's National Relief Fund</li>
                <li>State-specific cancer treatment schemes</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Hospital className="h-6 w-6 text-rose-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold">Hospital-based Support</h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Payment plans and installment options</li>
                <li>Charitable trust support</li>
                <li>Discounted treatment packages</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Pill className="h-6 w-6 text-rose-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold">Medication Assistance</h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Pharmaceutical company patient assistance programs</li>
                <li>Generic medication options</li>
                <li>NGO support for medication costs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-rose-50 p-6 rounded-xl">
        <p className="text-rose-800 text-sm">
          Disclaimer: This information is for educational purposes only and should not replace professional medical advice. 
          Costs mentioned are approximate and may vary based on location, hospital, and specific treatment requirements. 
          Always consult with healthcare professionals for diagnosis, treatment decisions, and accurate cost estimates.
        </p>
      </div>
    </div>
  );
}

export default CancerInfo;