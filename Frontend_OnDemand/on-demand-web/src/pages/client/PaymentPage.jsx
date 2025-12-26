import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { ArrowLeft, User, MapPin, Loader2, CheckCircle } from 'lucide-react';


import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';


import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// REMPLACEZ PAR VOTRE CLÉ PUBLIQUE STRIPE
const stripePromise = loadStripe("pk_test_VOTRE_CLE_STRIPE_PUBLIC"); 

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId, providerId, price, providerName, serviceName, address, lat, lng } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('Stripe'); 
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!serviceId) navigate('/client');
  }, [serviceId, navigate]);

  
  const finalizeOrder = async (transactionId, method) => {
    try {

        const orderRes = await axiosClient.post('/orders', {
            serviceId, providerId, price: parseFloat(price), address, lat, lng
        });
        const jobId = orderRes.data.jobId;

        // 2. Enregistrer le paiement
        await axiosClient.post('/payments/pay', {
            jobId,
            method: method, 
            transactionId: transactionId || `MANUAL-${Date.now()}`
        });

        toast.success("Paiement réussi ! Commande envoyée.");
        navigate('/client/orders');
    } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la finalisation.");
        setProcessing(false);
    }
  };

  // --- COMPOSANT INTERNE STRIPE ---
  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!stripe || !elements) return;
      setProcessing(true);

   
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        toast.error(error.message);
        setProcessing(false);
      } else {
        // Succès Stripe -> On finalise la commande
        await finalizeOrder(paymentMethod.id, 'Stripe');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="p-4 border rounded-xl mt-4">
        <div className="p-3 border rounded mb-4">
            <CardElement options={{style: {base: {fontSize: '16px'}}}}/>
        </div>
        <button type="submit" disabled={!stripe || processing} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
            {processing ? <Loader2 className="animate-spin mx-auto"/> : `Payer ${price} MAD`}
        </button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* GAUCHE : RÉCAP */}
        <div className="p-8 bg-blue-50 text-blue-900">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-sm font-bold opacity-70 hover:opacity-100">
                <ArrowLeft size={16}/> Annuler
            </button>
            <h1 className="text-3xl font-bold mb-6">Récapitulatif</h1>
            
            <div className="space-y-4">
                <div className="flex justify-between border-b border-blue-200 pb-2">
                    <span>Service</span>
                    <span className="font-bold">{serviceName}</span>
                </div>
                <div className="flex justify-between border-b border-blue-200 pb-2">
                    <span>Prestataire</span>
                    <span className="font-bold">{providerName}</span>
                </div>
                <div className="flex justify-between pt-4 text-xl font-bold">
                    <span>Total à payer</span>
                    <span>{price} MAD</span>
                </div>
            </div>
            <div className="mt-8 p-4 bg-white/50 rounded-xl text-sm flex gap-3">
                <CheckCircle className="text-green-600 shrink-0"/>
                <p>Paiement sécurisé. L'argent est bloqué jusqu'à la fin de la mission.</p>
            </div>
        </div>

        {/* DROITE : PAIEMENT */}
        <div className="p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Moyen de paiement</h2>
            
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                {['Stripe', 'PayPal', 'Cash', 'BankTransfer'].map(m => (
                    <button 
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition ${paymentMethod === m ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {m === 'BankTransfer' ? 'Virement' : m}
                    </button>
                ))}
            </div>

            {/* CONTENU DYNAMIQUE */}
            {paymentMethod === 'Stripe' && (
                <Elements stripe={stripePromise}>
                    <StripeForm />
                </Elements>
            )}

            {paymentMethod === 'PayPal' && (
                <PayPalScriptProvider options={{ "client-id": "test" }}>
                    <div className="mt-4">
                        <PayPalButtons 
                            style={{ layout: "vertical" }} 
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    purchase_units: [{ amount: { value: price.toString() } }]
                                });
                            }}
                            onApprove={(data, actions) => {
                                return actions.order.capture().then((details) => {
                                    finalizeOrder(details.id, 'PayPal');
                                });
                            }}
                        />
                    </div>
                </PayPalScriptProvider>
            )}

            {(paymentMethod === 'Cash' || paymentMethod === 'BankTransfer') && (
                <div className="mt-4 text-center">
                    <div className="p-6 bg-gray-50 rounded-xl mb-4 text-sm text-gray-600">
                        {paymentMethod === 'Cash' ? 
                            "Vous paierez le prestataire en espèces une fois sur place. La commande est validée immédiatement." : 
                            "Effectuez un virement au RIB : MA64 000... La commande sera validée après réception."
                        }
                    </div>
                    <button 
                        onClick={() => finalizeOrder(null, paymentMethod)}
                        disabled={processing}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                    >
                        {processing ? <Loader2 className="animate-spin mx-auto"/> : "Valider la commande"}
                    </button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}