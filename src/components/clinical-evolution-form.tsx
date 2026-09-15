import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { CreateClinicalEvolutionInput } from "@/lib/api";

export const emptyClinicalEvolution: CreateClinicalEvolutionInput = {
  address: "", sex: "", neighborhood: "", city: "", state: "", birthDate: "",
  nationality: "", maritalStatus: "", education: "", profession: "", responsible: "",
  specialty: "", admissionDate: "", chiefComplaint: "", currentHistory: "",
  previousHistory: "", familyHistory: "", skinCancer: "", habits: [], otherHabits: "",
  medications: "", cosmetics: "", botox: "", sunscreen: "", allergies: "", diet: "",
  menstrualStatus: "", menarcheAge: "", previousFacialTreatment: "", skinColor: "",
  skinType: "", glogauType: "", fitzpatrickType: "", hairLocations: [], acneGrade: "",
  skinAlterations: [], skinLaxity: "", skinLaxityLocation: "", wrinkles: "",
  wrinkleLocations: [], wrinkleType: "", tsujiClassification: "", lapierePierardGrade: "",
  dentalAssessment: [], touch: "", muscleTone: "", hydration: "", woodLamp: [],
  facialMeasurements: "", postoperativeFindings: [], pain: "", sensitivity: "",
  imageAssessment: "", clinicalDiagnosis: "", objective: "", conduct: "",
};

type Props = {
  value: CreateClinicalEvolutionInput;
  onChange: (value: CreateClinicalEvolutionInput) => void;
};

const choiceSets = {
  sex: ["Feminino", "Masculino", "Outro"],
  yesNo: ["Não", "Sim"],
  skinColor: ["Branca", "Parda", "Negra", "Amarela"],
  skinType: ["Eudérmica", "Mista", "Alípica", "Oleosa"],
  glogau: ["Tipo I", "Tipo II", "Tipo III", "Tipo IV"],
  fitzpatrick: ["Tipo I", "Tipo II", "Tipo III", "Tipo IV", "Tipo V", "Tipo VI"],
  acne: ["Ausente", "Grau I", "Grau II", "Grau III", "Grau IV"],
  wrinkleType: ["Estática", "Dinâmica"],
  tsuji: ["Superficial", "Profunda"],
  lapiere: ["Grau I", "Grau II", "Grau III"],
  touch: ["Lisa", "Áspera", "Fina"],
  tone: ["Hipotônico", "Normal", "Hipertônico"],
  hydration: ["Superficial", "Profunda"],
  sensitivity: ["Verde — normal", "Azul — tato leve diminuído", "Violeta — proteção diminuída", "Vermelho escuro — perda protetora"],
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="grid gap-4 border-t border-rose/30 pt-5"><h3 className="font-display text-xl text-ink">{title}</h3>{children}</section>;
}

function TextField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  const id = `clinical-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} type={type} required={required} maxLength={2000} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2" /></div>;
}

function LongField({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  const id = `clinical-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <div><Label htmlFor={id}>{label}</Label><Textarea id={id} required={required} minLength={required ? 2 : undefined} maxLength={4000} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-20" /></div>;
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <fieldset><legend className="text-sm font-medium text-ink">{label}</legend><RadioGroup value={value} onValueChange={onChange} className="mt-2 flex flex-wrap gap-x-5 gap-y-2">{options.map((option) => <div className="flex items-center gap-2" key={option}><RadioGroupItem value={option} id={`${label}-${option}`} /><Label htmlFor={`${label}-${option}`} className="font-normal">{option}</Label></div>)}</RadioGroup></fieldset>;
}

function MultiChoice({ label, values, options, onChange }: { label: string; values: string[]; options: readonly string[]; onChange: (value: string[]) => void }) {
  return <fieldset><legend className="text-sm font-medium text-ink">{label}</legend><div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{options.map((option) => <div className="flex items-center gap-2" key={option}><Checkbox id={`${label}-${option}`} checked={values.includes(option)} onCheckedChange={(checked) => onChange(checked ? [...values, option] : values.filter((item) => item !== option))} /><Label htmlFor={`${label}-${option}`} className="font-normal">{option}</Label></div>)}</div></fieldset>;
}

export function ClinicalEvolutionForm({ value, onChange }: Props) {
  const set = <K extends keyof CreateClinicalEvolutionInput>(key: K, fieldValue: CreateClinicalEvolutionInput[K]) => onChange({ ...value, [key]: fieldValue });
  return <div className="grid gap-6">
    <Section title="1. Identificação"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <TextField label="Endereço" value={value.address} onChange={(v) => set("address", v)} /><Choice label="Sexo" value={value.sex} options={choiceSets.sex} onChange={(v) => set("sex", v)} />
      <TextField label="Bairro" value={value.neighborhood} onChange={(v) => set("neighborhood", v)} /><TextField label="Cidade" value={value.city} onChange={(v) => set("city", v)} /><TextField label="UF" value={value.state} onChange={(v) => set("state", v)} />
      <TextField label="Data de nascimento" type="date" value={value.birthDate} onChange={(v) => set("birthDate", v)} /><TextField label="Naturalidade" value={value.nationality} onChange={(v) => set("nationality", v)} /><TextField label="Estado civil" value={value.maritalStatus} onChange={(v) => set("maritalStatus", v)} />
      <TextField label="Escolaridade" value={value.education} onChange={(v) => set("education", v)} /><TextField label="Profissão" value={value.profession} onChange={(v) => set("profession", v)} /><TextField label="Profissional responsável" value={value.responsible} onChange={(v) => set("responsible", v)} />
      <TextField label="Especialidade" value={value.specialty} onChange={(v) => set("specialty", v)} /><TextField label="Data de admissão" type="date" value={value.admissionDate} onChange={(v) => set("admissionDate", v)} />
    </div></Section>
    <Section title="2. Anamnese"><LongField label="Queixa principal" required value={value.chiefComplaint} onChange={(v) => set("chiefComplaint", v)} /><LongField label="História da doença atual (HDA)" value={value.currentHistory} onChange={(v) => set("currentHistory", v)} /><div className="grid gap-4 sm:grid-cols-2"><LongField label="Antecedentes pessoais (AP)" value={value.previousHistory} onChange={(v) => set("previousHistory", v)} /><LongField label="Antecedentes familiares (AF)" value={value.familyHistory} onChange={(v) => set("familyHistory", v)} /></div>
      <Choice label="Câncer de pele" value={value.skinCancer} options={choiceSets.yesNo} onChange={(v) => set("skinCancer", v)} /><MultiChoice label="Hábitos de vida" values={value.habits} options={["Tabagismo", "Etilismo", "Atividade física"]} onChange={(v) => set("habits", v)} /><TextField label="Outros hábitos" value={value.otherHabits} onChange={(v) => set("otherHabits", v)} />
      <div className="grid gap-4 sm:grid-cols-2"><TextField label="Medicamentos — quais e frequência" value={value.medications} onChange={(v) => set("medications", v)} /><TextField label="Cosméticos — quais e frequência" value={value.cosmetics} onChange={(v) => set("cosmetics", v)} /><TextField label="Botox — local e quando" value={value.botox} onChange={(v) => set("botox", v)} /><TextField label="Protetor solar — qual e frequência" value={value.sunscreen} onChange={(v) => set("sunscreen", v)} /><TextField label="Alergias — quais" value={value.allergies} onChange={(v) => set("allergies", v)} /><TextField label="Alimentação" value={value.diet} onChange={(v) => set("diet", v)} /><TextField label="Menstruação / menopausa / histerectomia" value={value.menstrualStatus} onChange={(v) => set("menstrualStatus", v)} /><TextField label="Menarca / idade" value={value.menarcheAge} onChange={(v) => set("menarcheAge", v)} /></div><LongField label="Tratamento facial anterior e resultados" value={value.previousFacialTreatment} onChange={(v) => set("previousFacialTreatment", v)} />
    </Section>
    <Section title="3. Exame físico-funcional"><div className="grid gap-5 sm:grid-cols-2"><Choice label="Cor da pele" value={value.skinColor} options={choiceSets.skinColor} onChange={(v) => set("skinColor", v)} /><Choice label="Tipo de pele" value={value.skinType} options={choiceSets.skinType} onChange={(v) => set("skinType", v)} /><Choice label="Classificação de Glogau" value={value.glogauType} options={choiceSets.glogau} onChange={(v) => set("glogauType", v)} /><Choice label="Fototipo de Fitzpatrick" value={value.fitzpatrickType} options={choiceSets.fitzpatrick} onChange={(v) => set("fitzpatrickType", v)} /></div>
      <MultiChoice label="Pilosidade" values={value.hairLocations} options={["Face", "Buço", "Pescoço"]} onChange={(v) => set("hairLocations", v)} /><Choice label="Acne" value={value.acneGrade} options={choiceSets.acne} onChange={(v) => set("acneGrade", v)} /><MultiChoice label="Alterações" values={value.skinAlterations} options={["Mílio", "Seborreia", "Rosácea", "Melasma", "Acromias", "Couperouse", "Xantelasma", "Dermatite", "Efélides", "Nevus", "Hidroadenoma", "Tricose", "Verrugas", "Fotoenvelhecimento"]} onChange={(v) => set("skinAlterations", v)} />
      <div className="grid gap-4 sm:grid-cols-2"><Choice label="Flacidez de pele" value={value.skinLaxity} options={choiceSets.yesNo} onChange={(v) => set("skinLaxity", v)} /><TextField label="Localização da flacidez" value={value.skinLaxityLocation} onChange={(v) => set("skinLaxityLocation", v)} /><Choice label="Rugas" value={value.wrinkles} options={choiceSets.yesNo} onChange={(v) => set("wrinkles", v)} /><Choice label="Tipo de ruga" value={value.wrinkleType} options={choiceSets.wrinkleType} onChange={(v) => set("wrinkleType", v)} /></div><MultiChoice label="Localização das rugas" values={value.wrinkleLocations} options={["Glabelar", "Frontal", "Malar", "Periorbicular", "Perioral", "Nasogeniano", "Mentoniana", "Cervical anterior"]} onChange={(v) => set("wrinkleLocations", v)} />
      <div className="grid gap-5 sm:grid-cols-2"><Choice label="Classificação de Tsuji" value={value.tsujiClassification} options={choiceSets.tsuji} onChange={(v) => set("tsujiClassification", v)} /><Choice label="Classificação de Lapiere e Pierard" value={value.lapierePierardGrade} options={choiceSets.lapiere} onChange={(v) => set("lapierePierardGrade", v)} /></div><MultiChoice label="Avaliação odontológica" values={value.dentalAssessment} options={["Normal", "Amálgama", "Macrognatismo", "Micrognatismo", "Aparelho ortodôntico", "Implante dentário", "Prótese"]} onChange={(v) => set("dentalAssessment", v)} />
      <div className="grid gap-5 sm:grid-cols-3"><Choice label="Tato" value={value.touch} options={choiceSets.touch} onChange={(v) => set("touch", v)} /><Choice label="Tônus muscular" value={value.muscleTone} options={choiceSets.tone} onChange={(v) => set("muscleTone", v)} /><Choice label="Hidratação" value={value.hydration} options={choiceSets.hydration} onChange={(v) => set("hydration", v)} /></div><MultiChoice label="Lâmpada de Wood" values={value.woodLamp} options={["Azul violeta leve", "Violeta intensa", "Violeta pálida", "Dourado", "Esbranquiçada", "Escura", "Rosa"]} onChange={(v) => set("woodLamp", v)} /><LongField label="Medidas faciais — D/E" value={value.facialMeasurements} onChange={(v) => set("facialMeasurements", v)} />
    </Section>
    <Section title="4. Pós-operatório e imagens"><MultiChoice label="Achados pós-operatórios" values={value.postoperativeFindings} options={["Infecção", "Deiscência", "Edema", "Equimose", "Hematoma", "Petéquias", "Víbice", "Aderência", "Retração", "Cicatriz hipertrófica", "Queloide"]} onChange={(v) => set("postoperativeFindings", v)} /><div className="grid gap-5 sm:grid-cols-2"><Choice label="Dor" value={value.pain} options={choiceSets.yesNo} onChange={(v) => set("pain", v)} /><Choice label="Sensibilidade" value={value.sensitivity} options={choiceSets.sensitivity} onChange={(v) => set("sensitivity", v)} /></div><LongField label="Avaliação por imagem — vídeo, fotos e comentários" value={value.imageAssessment} onChange={(v) => set("imageAssessment", v)} /></Section>
    <Section title="5. Tratamento fisioterapêutico"><LongField label="Diagnóstico clínico-funcional" required value={value.clinicalDiagnosis} onChange={(v) => set("clinicalDiagnosis", v)} /><LongField label="Objetivo" required value={value.objective} onChange={(v) => set("objective", v)} /><LongField label="Conduta" required value={value.conduct} onChange={(v) => set("conduct", v)} /></Section>
  </div>;
}

const summaryFields: Array<[keyof CreateClinicalEvolutionInput, string]> = [["chiefComplaint", "Queixa principal"], ["currentHistory", "HDA"], ["skinType", "Tipo de pele"], ["glogauType", "Glogau"], ["fitzpatrickType", "Fitzpatrick"], ["acneGrade", "Acne"], ["skinAlterations", "Alterações"], ["postoperativeFindings", "Achados pós-operatórios"], ["clinicalDiagnosis", "Diagnóstico clínico-funcional"], ["objective", "Objetivo"], ["conduct", "Conduta"]];

export function ClinicalEvolutionDetails({ value }: { value: CreateClinicalEvolutionInput }) {
  return <dl className="mt-3 grid gap-2 text-inksoft">{summaryFields.map(([key, label]) => { const content = value[key]; if (!content || (Array.isArray(content) && content.length === 0)) return null; return <div key={key}><dt className="font-semibold text-ink">{label}</dt><dd className="whitespace-pre-wrap">{Array.isArray(content) ? content.join(", ") : content}</dd></div>; })}</dl>;
}