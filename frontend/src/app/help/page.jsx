import Back from '@/app/ui/back';
import Faq from '@/app/ui/help/faq';
export default function Page() {
  return (
    <div>
      <div>
        <Back pagename="Help" />
      </div>
      <div className="">
        <Faq />
      </div>
    </div>
  );
}
